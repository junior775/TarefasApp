import AsyncStorage from "@react-native-async-storage/async-storage";

import { apiFetch } from "@/constants/api";

export type Usuario = {
  id: string;
  nome: string;
  email: string;
  senha: string;
};

type CreateUserInput = {
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
const SECURITY_EVENTS_KEY = "security_events";
const memoryStorage = new Map<string, string>();

const DEFAULT_USERS: Usuario[] = [
  {
    id: "1",
    nome: "Emerson",
    email: "emersonrobertojunior07@gmail.com",
    senha: "123",
  },
];

const DEFAULT_TASK_VALUES = {
  prioridade: "media" as Prioridade,
  categoria: "Pessoal" as Categoria,
  observacao: "",
};

function sanitizeText(value: string, maxLength = 160) {
  return value
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export async function registerSecurityEvent(evento: string, detalhe = "") {
  const events = await readJson<
    Array<{ id: number; evento: string; detalhe: string; criadoEm: string }>
  >(SECURITY_EVENTS_KEY, []);
  const nextId = events.length > 0 ? Math.max(...events.map((item) => item.id)) + 1 : 1;

  await writeJson(SECURITY_EVENTS_KEY, [
    ...events.slice(-49),
    {
      id: nextId,
      evento: sanitizeText(evento, 80),
      detalhe: sanitizeText(detalhe, 160),
      criadoEm: new Date().toISOString(),
    },
  ]);
}

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
  const missingDefaultUsers = DEFAULT_USERS.filter(
    (defaultUser) =>
      !existingUsers.some(
        (existingUser) =>
          existingUser.email.toLowerCase() === defaultUser.email.toLowerCase()
      )
  );

  if (existingUsers.length === 0) {
    await writeJson(LOCAL_USERS_KEY, DEFAULT_USERS);
    return DEFAULT_USERS;
  }

  if (missingDefaultUsers.length > 0) {
    const updatedUsers = [...existingUsers, ...missingDefaultUsers];
    await writeJson(LOCAL_USERS_KEY, updatedUsers);
    return updatedUsers;
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

    const remoteUsers = (await resposta.json()) as Usuario[];
    const usuarios = [
      ...remoteUsers,
      ...DEFAULT_USERS.filter(
        (defaultUser) =>
          !remoteUsers.some(
            (remoteUser) =>
              remoteUser.email.toLowerCase() === defaultUser.email.toLowerCase()
          )
      ),
    ];

    await writeJson(LOCAL_USERS_KEY, usuarios);
    return { usuarios, offline: false };
  } catch {
    const usuarios = await ensureLocalUsers();
    return { usuarios, offline: true };
  }
}

export async function createUsuario({ nome, email, senha }: CreateUserInput) {
  const normalizedEmail = normalizeEmail(email);
  const normalizedName = sanitizeText(nome, 80);
  const { usuarios } = await getUsuarios();
  const usuarioExistente = usuarios.find(
    (usuario) => usuario.email.toLowerCase() === normalizedEmail
  );

  if (usuarioExistente) {
    throw new Error("EMAIL_JA_CADASTRADO");
  }

  const novoUsuario: Usuario = {
    id:
      usuarios.length > 0
        ? String(Math.max(...usuarios.map((usuario) => Number(usuario.id) || 0)) + 1)
        : "1",
    nome: normalizedName,
    email: normalizedEmail,
    senha: senha.trim(),
  };

  try {
    const resposta = await apiFetch("/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(novoUsuario),
    });

    if (!resposta.ok) {
      throw new Error("Falha ao criar usuario");
    }

    const usuariosAtualizados = [...usuarios, novoUsuario];
    await writeJson(LOCAL_USERS_KEY, usuariosAtualizados);
    return { usuario: novoUsuario, offline: false };
  } catch {
    const usuariosAtualizados = [...usuarios, novoUsuario];
    await writeJson(LOCAL_USERS_KEY, usuariosAtualizados);
    return { usuario: novoUsuario, offline: true };
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
  const sanitizedTitle = sanitizeText(titulo, 120);
  const sanitizedObservation = sanitizeText(observacao, 240);

  if (!sanitizedTitle) {
    throw new Error("TITULO_INVALIDO");
  }

  const payload = {
    titulo: sanitizedTitle,
    concluida: false,
    prioridade,
    categoria,
    observacao: sanitizedObservation,
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

export async function saveTarefa(item: Tarefa) {
  const sanitizedTitle = sanitizeText(item.titulo, 120);
  const sanitizedObservation = sanitizeText(item.observacao, 240);

  if (!sanitizedTitle) {
    throw new Error("TITULO_INVALIDO");
  }

  const updatedItem = normalizeTask({
    ...item,
    titulo: sanitizedTitle,
    observacao: sanitizedObservation,
  });

  try {
    const resposta = await apiFetch(`/tarefas/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedItem),
    });

    if (!resposta.ok) {
      throw new Error("Falha ao salvar tarefa");
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
