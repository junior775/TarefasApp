import AsyncStorage from "@react-native-async-storage/async-storage";

import { apiFetch } from "@/constants/api";

export type Usuario = {
  id: string;
  nome: string;
  email: string;
  senha: string;
};

export type Prioridade = "baixa" | "media" | "alta";
export type Categoria =
  | "Trabalho"
  | "Estudo"
  | "Casa"
  | "Saude"
  | "Pessoal";

export type Tarefa = {
  id: number;
  titulo: string;
  concluida: boolean;
  prioridade: Prioridade;
  categoria: Categoria;
  observacao: string;
  criadaEm: string;
};

type CreateTaskInput = {
  titulo: string;
  prioridade?: Prioridade;
  categoria?: Categoria;
  observacao?: string;
};

const LOCAL_USERS_KEY = "local_usuarios";
const LOCAL_TASKS_KEY = "local_tarefas";
const SESSION_USER_KEY = "usuario";
const memoryStorage = new Map<string, string>();

const DEFAULT_USERS: Usuario[] = [
  {
    id: "1",
    nome: "Emerson",
    email: "emerson@gmail.com",
    senha: "123",
  },
];

const DEFAULT_TASK_VALUES = {
  prioridade: "media" as Prioridade,
  categoria: "Pessoal" as Categoria,
  observacao: "",
};

function normalizeTask(task: Partial<Tarefa> & Pick<Tarefa, "id" | "titulo" | "concluida">): Tarefa {
  return {
    id: Number(task.id),
    titulo: task.titulo,
    concluida: Boolean(task.concluida),
    prioridade: task.prioridade ?? DEFAULT_TASK_VALUES.prioridade,
    categoria: task.categoria ?? DEFAULT_TASK_VALUES.categoria,
    observacao: task.observacao ?? DEFAULT_TASK_VALUES.observacao,
    criadaEm: task.criadaEm ?? new Date().toISOString(),
  };
}

async function getStoredValue(key: string) {
  try {
    const value = await AsyncStorage.getItem(key);

    if (value !== null) {
      memoryStorage.set(key, value);
      return value;
    }
  } catch {}

  return memoryStorage.get(key) ?? null;
}

async function setStoredValue(key: string, value: string) {
  memoryStorage.set(key, value);

  try {
    await AsyncStorage.setItem(key, value);
  } catch {}
}

async function removeStoredValue(key: string) {
  memoryStorage.delete(key);

  try {
    await AsyncStorage.removeItem(key);
  } catch {}
}

async function readJson<T>(key: string, fallback: T): Promise<T> {
  const value = await getStoredValue(key);

  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(key: string, value: unknown) {
  await setStoredValue(key, JSON.stringify(value));
}

async function ensureLocalUsers() {
  const existingUsers = await readJson<Usuario[]>(LOCAL_USERS_KEY, []);

  if (existingUsers.length === 0) {
    await writeJson(LOCAL_USERS_KEY, DEFAULT_USERS);
    return DEFAULT_USERS;
  }

  return existingUsers;
}

async function readLocalTasks() {
  const tarefas = await readJson<Array<Partial<Tarefa> & Pick<Tarefa, "id" | "titulo" | "concluida">>>(
    LOCAL_TASKS_KEY,
    []
  );

  return tarefas.map(normalizeTask);
}

async function writeLocalTasks(tarefas: Tarefa[]) {
  await writeJson(LOCAL_TASKS_KEY, tarefas);
}

export async function getUsuarios() {
  try {
    const resposta = await apiFetch("/usuarios");

    if (!resposta.ok) {
      throw new Error("Falha ao buscar usuarios");
    }

    const usuarios = (await resposta.json()) as Usuario[];
    await writeJson(LOCAL_USERS_KEY, usuarios);
    return { usuarios, offline: false };
  } catch {
    const usuarios = await ensureLocalUsers();
    return { usuarios, offline: true };
  }
}

export async function setSessionUser(usuario: Usuario) {
  await writeJson(SESSION_USER_KEY, usuario);
}

export async function getSessionUser() {
  return readJson<Usuario | null>(SESSION_USER_KEY, null);
}

export async function clearSessionUser() {
  await removeStoredValue(SESSION_USER_KEY);
}

export async function getTarefas() {
  try {
    const resposta = await apiFetch("/tarefas");

    if (!resposta.ok) {
      throw new Error("Falha ao buscar tarefas");
    }

    const tarefas = ((await resposta.json()) as Array<
      Partial<Tarefa> & Pick<Tarefa, "id" | "titulo" | "concluida">
    >).map(normalizeTask);

    await writeLocalTasks(tarefas);
    return { tarefas, offline: false };
  } catch {
    const tarefas = await readLocalTasks();
    return { tarefas, offline: true };
  }
}

export async function createTarefa({
  titulo,
  prioridade = DEFAULT_TASK_VALUES.prioridade,
  categoria = DEFAULT_TASK_VALUES.categoria,
  observacao = DEFAULT_TASK_VALUES.observacao,
}: CreateTaskInput) {
  const payload = {
    titulo,
    concluida: false,
    prioridade,
    categoria,
    observacao,
    criadaEm: new Date().toISOString(),
  };

  try {
    const resposta = await apiFetch("/tarefas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!resposta.ok) {
      throw new Error("Falha ao criar tarefa");
    }

    return { offline: false };
  } catch {
    const tarefas = await readLocalTasks();
    const nextId =
      tarefas.length > 0 ? Math.max(...tarefas.map((item) => item.id)) + 1 : 1;

    const updatedTasks = [...tarefas, normalizeTask({ id: nextId, ...payload })];
    await writeLocalTasks(updatedTasks);
    return { offline: true };
  }
}

export async function removeTarefa(id: number) {
  try {
    const resposta = await apiFetch(`/tarefas/${id}`, {
      method: "DELETE",
    });

    if (!resposta.ok) {
      throw new Error("Falha ao excluir tarefa");
    }

    return { offline: false };
  } catch {
    const tarefas = await readLocalTasks();
    const updatedTasks = tarefas.filter((item) => item.id !== id);
    await writeLocalTasks(updatedTasks);
    return { offline: true };
  }
}

export async function updateTarefa(item: Tarefa) {
  const updatedItem = normalizeTask({
    ...item,
    concluida: !item.concluida,
  });

  try {
    const resposta = await apiFetch(`/tarefas/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedItem),
    });

    if (!resposta.ok) {
      throw new Error("Falha ao atualizar tarefa");
    }

    return { offline: false };
  } catch {
    const tarefas = await readLocalTasks();
    const updatedTasks = tarefas.map((tarefa) =>
      tarefa.id === item.id ? updatedItem : tarefa
    );

    await writeLocalTasks(updatedTasks);
    return { offline: true };
  }
}

export async function clearCompletedTasks() {
  try {
    const { tarefas } = await getTarefas();

    await Promise.all(
      tarefas
        .filter((item) => item.concluida)
        .map((item) =>
          apiFetch(`/tarefas/${item.id}`, {
            method: "DELETE",
          })
        )
    );

    return { offline: false };
  } catch {
    const tarefas = await readLocalTasks();
    await writeLocalTasks(tarefas.filter((item) => !item.concluida));
    return { offline: true };
  }
}
