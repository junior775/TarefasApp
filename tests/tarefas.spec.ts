import { expect, Page, test } from "@playwright/test";

const TEST_USER = {
  id: "1",
  nome: "Emerson",
  email: "emersonrobertojunior07@gmail.com",
  senha: "123",
};

type Task = {
  id: number;
  titulo: string;
  concluida: boolean;
  prioridade: "baixa" | "media" | "alta";
  categoria: "Trabalho" | "Estudo" | "Casa" | "Saude" | "Pessoal";
  observacao: string;
  criadaEm: string;
};

const evidence = (name: string) => `docs/evidencias/${name}`;

async function setupApiMock(page: Page, initialTasks: Task[] = []) {
  let tasks = [...initialTasks];
  let nextId =
    tasks.length > 0 ? Math.max(...tasks.map((task) => task.id)) + 1 : 1;

  await page.route("**/usuarios", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({ json: [TEST_USER] });
      return;
    }

    await route.fulfill({ status: 201, json: TEST_USER });
  });

  await page.route("**/tarefas", async (route) => {
    const request = route.request();

    if (request.method() === "GET") {
      await route.fulfill({ json: tasks });
      return;
    }

    if (request.method() === "POST") {
      const payload = request.postDataJSON() as Omit<Task, "id">;
      const newTask = { ...payload, id: nextId++ };
      tasks = [...tasks, newTask];
      await route.fulfill({ status: 201, json: newTask });
      return;
    }

    await route.fallback();
  });

  await page.route("**/tarefas/*", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const id = Number(url.pathname.split("/").pop());

    if (request.method() === "PUT") {
      const payload = request.postDataJSON() as Task;
      tasks = tasks.map((task) => (task.id === id ? payload : task));
      await route.fulfill({ json: payload });
      return;
    }

    if (request.method() === "DELETE") {
      tasks = tasks.filter((task) => task.id !== id);
      await route.fulfill({ status: 200, json: {} });
      return;
    }

    await route.fallback();
  });
}

async function goToLogin(page: Page) {
  await page.goto("/login");
  await expect(page.getByText("Entrar no painel de tarefas")).toBeVisible();
}

async function login(page: Page) {
  await goToLogin(page);
  const emailInput = page.getByPlaceholder("Digite seu email");
  const passwordInput = page.getByPlaceholder("Digite sua senha");

  await emailInput.click();
  await emailInput.fill(TEST_USER.email);
  await expect(emailInput).toHaveValue(TEST_USER.email);

  await passwordInput.click();
  await passwordInput.fill(TEST_USER.senha);
  await expect(passwordInput).toHaveValue(TEST_USER.senha);

  await page.getByText("Entrar no painel", { exact: true }).click();
  await expect(page.getByText("Painel inteligente")).toBeVisible({ timeout: 10_000 });
}

async function addTask(page: Page, title: string, note = "Evidencia gerada pelo Playwright") {
  await page.getByPlaceholder("Ex.: Finalizar proposta comercial").fill(title);
  await page.getByPlaceholder("Observacao opcional").fill(note);
  await page.getByText("Adicionar tarefa").click();
  await expect(page.getByText(title)).toBeVisible();
}

test.describe("TarefasApp - plano de testes E2E", () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMock(page);
  });

  test("CT01 - Abrir a pagina de login", async ({ page }) => {
    await goToLogin(page);
    await expect(page.getByText("Login")).toBeVisible();
    await page.screenshot({ path: evidence("CT01-login.png"), fullPage: true });
  });

  test("CT02 - Tentar login sem preencher campos", async ({ page }) => {
    await goToLogin(page);
    await page.getByText("Entrar no painel", { exact: true }).click();
    await expect(page.getByText("Login")).toBeVisible();
    await expect(page.getByText("Painel inteligente")).not.toBeVisible();
    await page.screenshot({ path: evidence("CT02-login-vazio.png"), fullPage: true });
  });

  test("CT03 - Login com usuario valido", async ({ page }) => {
    await login(page);
    await expect(page.getByText("Suas tarefas")).toBeVisible();
    await page.screenshot({ path: evidence("CT03-login-valido.png"), fullPage: true });
  });

  test("CT04 - Login com senha invalida", async ({ page }) => {
    await goToLogin(page);
    page.once("dialog", async (dialog) => {
      expect(dialog.message()).toContain("Email ou senha invalidos");
      await dialog.dismiss();
    });
    await page.getByPlaceholder("Digite seu email").fill(TEST_USER.email);
    await page.getByPlaceholder("Digite sua senha").fill("senha-errada");
    await page.getByText("Entrar no painel", { exact: true }).click();
    await expect(page.getByText("Login")).toBeVisible();
    await page.screenshot({ path: evidence("CT04-senha-invalida.png"), fullPage: true });
  });

  test("CT05 - Verificar carregamento da lista de tarefas", async ({ page }) => {
    await login(page);
    await expect(page.getByText("Suas tarefas")).toBeVisible();
    await expect(page.getByPlaceholder("Buscar por titulo, categoria ou observacao")).toBeVisible();
    await page.screenshot({ path: evidence("CT05-lista-tarefas.png"), fullPage: true });
  });

  test("CT06 - Adicionar uma tarefa", async ({ page }) => {
    await login(page);
    await addTask(page, "Preparar apresentacao do projeto");
    await page.screenshot({ path: evidence("CT06-adicionar-tarefa.png"), fullPage: true });
  });

  test("CT07 - Editar uma tarefa", async ({ page }) => {
    await login(page);
    await addTask(page, "Tarefa para editar");
    await page.getByText("Editar", { exact: true }).click();
    await page.getByPlaceholder("Ex.: Finalizar proposta comercial").fill("Tarefa editada com sucesso");
    await page.getByText("Salvar tarefa").click();
    await expect(page.getByText("Tarefa editada com sucesso")).toBeVisible();
    await expect(page.getByText("Tarefa para editar")).not.toBeVisible();
    await page.screenshot({ path: evidence("CT07-editar-tarefa.png"), fullPage: true });
  });

  test("CT08 - Excluir uma tarefa", async ({ page }) => {
    await login(page);
    await addTask(page, "Tarefa para excluir");
    await page.getByText("Excluir", { exact: true }).click();
    await expect(page.getByText("Tarefa para excluir")).not.toBeVisible();
    await expect(page.getByText("Nada por aqui ainda")).toBeVisible();
    await page.screenshot({ path: evidence("CT08-excluir-tarefa.png"), fullPage: true });
  });

  test("CT09 - Verificar se a tarefa adicionada aparece na lista", async ({ page }) => {
    await login(page);
    await addTask(page, "Revisar relatorio de testes");
    await page.getByPlaceholder("Buscar por titulo, categoria ou observacao").fill("Revisar relatorio");
    await expect(page.getByText("Revisar relatorio de testes")).toBeVisible();
    await page.screenshot({ path: evidence("CT09-tarefa-na-lista.png"), fullPage: true });
  });

  test("CT10 - Fazer logout e retornar para login", async ({ page }) => {
    await login(page);
    await page.getByText("Sair").click();
    await expect(page.getByText("Entrar no painel de tarefas")).toBeVisible();
    await expect(page.getByText("Login")).toBeVisible();
    await page.screenshot({ path: evidence("CT10-logout.png"), fullPage: true });
  });
});
