import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  Categoria,
  clearCompletedTasks,
  clearSessionUser,
  createTarefa,
  getSessionUser,
  getTarefas,
  Prioridade,
  removeTarefa,
  Tarefa,
  updateTarefa,
} from "@/services/data";

const categories: Categoria[] = [
  "Trabalho",
  "Estudo",
  "Casa",
  "Saude",
  "Pessoal",
];

const priorities: Prioridade[] = ["baixa", "media", "alta"];

const quickTemplates = [
  {
    titulo: "Revisar pendencias do dia",
    categoria: "Trabalho" as Categoria,
    prioridade: "alta" as Prioridade,
  },
  {
    titulo: "Estudar por 30 minutos",
    categoria: "Estudo" as Categoria,
    prioridade: "media" as Prioridade,
  },
  {
    titulo: "Separar rotina da casa",
    categoria: "Casa" as Categoria,
    prioridade: "baixa" as Prioridade,
  },
];

type FilterMode = "todas" | "pendentes" | "concluidas" | "urgentes";

const priorityLabels: Record<Prioridade, string> = {
  baixa: "Baixa",
  media: "Media",
  alta: "Alta",
};

const priorityColors: Record<Prioridade, string> = {
  baixa: "#4b8f6b",
  media: "#bf7b21",
  alta: "#b34141",
};

const categoryColors: Record<Categoria, string> = {
  Trabalho: "#315d8a",
  Estudo: "#7452b8",
  Casa: "#5f8f2f",
  Saude: "#2a8c88",
  Pessoal: "#b16b2f",
};

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  }).format(new Date(dateString));
}

function getGreeting(name: string) {
  const hour = new Date().getHours();

  if (hour < 12) return `Bom dia, ${name}`;
  if (hour < 18) return `Boa tarde, ${name}`;
  return `Boa noite, ${name}`;
}

export default function HomeScreen() {
  const [titulo, setTitulo] = useState("");
  const [observacao, setObservacao] = useState("");
  const [busca, setBusca] = useState("");
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [nome, setNome] = useState("");
  const [erro, setErro] = useState("");
  const [modoOffline, setModoOffline] = useState(false);
  const [filtro, setFiltro] = useState<FilterMode>("todas");
  const [categoriaSelecionada, setCategoriaSelecionada] =
    useState<Categoria>("Pessoal");
  const [prioridadeSelecionada, setPrioridadeSelecionada] =
    useState<Prioridade>("media");
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const router = useRouter();

  const buscarTarefas = async () => {
    try {
      setErro("");
      const { tarefas: lista, offline } = await getTarefas();
      setTarefas(
        [...lista].sort(
          (a, b) =>
            Number(a.concluida) - Number(b.concluida) ||
            new Date(b.criadaEm).getTime() - new Date(a.criadaEm).getTime()
        )
      );
      setModoOffline(offline);
    } catch (error) {
      console.log(error);
      setErro("Nao foi possivel carregar as tarefas.");
      setTarefas([]);
    }
  };

  useEffect(() => {
    const carregarUsuario = async () => {
      const usuario = await getSessionUser();

      if (!usuario) {
        router.replace("/login");
        return;
      }

      setNome(usuario.nome);
      buscarTarefas();
    };

    carregarUsuario();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, router]);

  const adicionarTarefa = async () => {
    if (!titulo.trim()) return;

    try {
      const { offline } = await createTarefa({
        titulo: titulo.trim(),
        observacao: observacao.trim(),
        categoria: categoriaSelecionada,
        prioridade: prioridadeSelecionada,
      });

      setModoOffline(offline);
      setTitulo("");
      setObservacao("");
      setCategoriaSelecionada("Pessoal");
      setPrioridadeSelecionada("media");
      await buscarTarefas();
    } catch (error) {
      console.log(error);
      setErro("Nao foi possivel adicionar a tarefa.");
    }
  };

  const aplicarTemplate = (item: {
    titulo: string;
    categoria: Categoria;
    prioridade: Prioridade;
  }) => {
    setTitulo(item.titulo);
    setCategoriaSelecionada(item.categoria);
    setPrioridadeSelecionada(item.prioridade);
  };

  const deletarTarefa = async (id: number) => {
    try {
      const { offline } = await removeTarefa(id);
      setModoOffline(offline);
      await buscarTarefas();
    } catch (error) {
      console.log(error);
      setErro("Nao foi possivel excluir a tarefa.");
    }
  };

  const concluirTarefa = async (item: Tarefa) => {
    try {
      const { offline } = await updateTarefa(item);
      setModoOffline(offline);
      await buscarTarefas();
    } catch (error) {
      console.log(error);
      setErro("Nao foi possivel atualizar a tarefa.");
    }
  };

  const limparConcluidas = async () => {
    try {
      const { offline } = await clearCompletedTasks();
      setModoOffline(offline);
      await buscarTarefas();
    } catch (error) {
      console.log(error);
      setErro("Nao foi possivel limpar as tarefas concluidas.");
    }
  };

  const sair = async () => {
    await clearSessionUser();
    router.replace("/login");
  };

  const tarefasPendentes = tarefas.filter((item) => !item.concluida);
  const tarefasConcluidas = tarefas.filter((item) => item.concluida);
  const tarefasUrgentes = tarefas.filter(
    (item) => item.prioridade === "alta" && !item.concluida
  );
  const progresso =
    tarefas.length === 0 ? 0 : Math.round((tarefasConcluidas.length / tarefas.length) * 100);

  const tarefasFiltradas = tarefas.filter((item) => {
    const matchBusca =
      item.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      item.categoria.toLowerCase().includes(busca.toLowerCase()) ||
      item.observacao.toLowerCase().includes(busca.toLowerCase());

    if (!matchBusca) return false;

    if (filtro === "pendentes") return !item.concluida;
    if (filtro === "concluidas") return item.concluida;
    if (filtro === "urgentes") return item.prioridade === "alta" && !item.concluida;

    return true;
  });

  return (
    <Animated.ScrollView
      style={{ flex: 1, backgroundColor: "#f5efe7", opacity: fadeAnim }}
      contentContainerStyle={{ padding: 18, paddingBottom: 42 }}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={{
          backgroundColor: "#1d3652",
          borderRadius: 30,
          padding: 24,
          overflow: "hidden",
          marginBottom: 18,
        }}
      >
        <View
          style={{
            position: "absolute",
            top: -40,
            right: -30,
            width: 150,
            height: 150,
            borderRadius: 999,
            backgroundColor: "#f9b55c",
            opacity: 0.25,
          }}
        />
        <Text style={{ color: "#ffd8a8", fontWeight: "700", marginBottom: 10 }}>
          Painel inteligente
        </Text>
        <Text
          style={{
            color: "#fff9ef",
            fontSize: 28,
            fontWeight: "800",
            lineHeight: 34,
          }}
        >
          {getGreeting(nome || "Emerson")}
        </Text>
        <Text style={{ color: "#d4dfeb", marginTop: 10, lineHeight: 22 }}>
          Organize o dia com foco, acompanhe prioridades e mantenha tudo em um
          lugar so.
        </Text>

        <View
          style={{
            marginTop: 24,
            backgroundColor: "rgba(255,255,255,0.12)",
            borderRadius: 24,
            padding: 16,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View>
            <Text style={{ color: "#d9e5ef", marginBottom: 6 }}>Progresso do dia</Text>
            <Text style={{ color: "#fff", fontSize: 26, fontWeight: "800" }}>
              {progresso}%
            </Text>
          </View>

          <View
            style={{
              width: 78,
              height: 78,
              borderRadius: 999,
              borderWidth: 8,
              borderColor: "rgba(255,255,255,0.18)",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#24486e",
            }}
          >
            <Text style={{ color: "#ffd8a8", fontWeight: "800" }}>
              {tarefasConcluidas.length}/{tarefas.length || 0}
            </Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 18,
            gap: 10,
          }}
        >
          <TouchableOpacity
            onPress={limparConcluidas}
            style={{
              backgroundColor: "rgba(255,255,255,0.13)",
              borderRadius: 16,
              paddingVertical: 12,
              paddingHorizontal: 16,
              flex: 1,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "700", textAlign: "center" }}>
              Limpar concluidas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={sair}
            style={{
              backgroundColor: "#f8e2c0",
              borderRadius: 16,
              paddingVertical: 12,
              paddingHorizontal: 16,
            }}
          >
            <Text style={{ color: "#7c4d19", fontWeight: "700" }}>Sair</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ flexDirection: "row", gap: 12, marginBottom: 18 }}>
        {[
          { label: "Pendentes", value: tarefasPendentes.length, color: "#fff6e4" },
          { label: "Concluidas", value: tarefasConcluidas.length, color: "#ebf7ef" },
          { label: "Urgentes", value: tarefasUrgentes.length, color: "#fdeced" },
        ].map((item) => (
          <View
            key={item.label}
            style={{
              flex: 1,
              backgroundColor: item.color,
              borderRadius: 22,
              padding: 16,
            }}
          >
            <Text style={{ color: "#56606b", marginBottom: 8 }}>{item.label}</Text>
            <Text style={{ fontSize: 24, fontWeight: "800", color: "#182332" }}>
              {item.value}
            </Text>
          </View>
        ))}
      </View>

      <View
        style={{
          backgroundColor: "#fffaf4",
          borderRadius: 26,
          padding: 18,
          marginBottom: 18,
          borderWidth: 1,
          borderColor: "#eadfce",
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: "800", color: "#1b2b3d" }}>
          Nova tarefa
        </Text>
        <Text style={{ color: "#6f7a86", marginTop: 4, marginBottom: 16 }}>
          Crie tarefas com prioridade, categoria e observacao.
        </Text>

        <TextInput
          placeholder="Ex.: Finalizar proposta comercial"
          placeholderTextColor="#8e98a3"
          value={titulo}
          onChangeText={setTitulo}
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 18,
            paddingHorizontal: 16,
            paddingVertical: 14,
            borderWidth: 1,
            borderColor: "#e4dccd",
            marginBottom: 12,
          }}
        />

        <TextInput
          placeholder="Observacao opcional"
          placeholderTextColor="#8e98a3"
          value={observacao}
          onChangeText={setObservacao}
          multiline
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 18,
            paddingHorizontal: 16,
            paddingVertical: 14,
            borderWidth: 1,
            borderColor: "#e4dccd",
            minHeight: 88,
            textAlignVertical: "top",
            marginBottom: 14,
          }}
        />

        <Text style={{ color: "#3e4a57", fontWeight: "700", marginBottom: 10 }}>
          Categoria
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 14 }}
        >
          <View style={{ flexDirection: "row", gap: 10 }}>
            {categories.map((item) => {
              const selected = item === categoriaSelecionada;

              return (
                <TouchableOpacity
                  key={item}
                  onPress={() => setCategoriaSelecionada(item)}
                  style={{
                    backgroundColor: selected ? categoryColors[item] : "#f1ebe0",
                    borderRadius: 999,
                    paddingVertical: 10,
                    paddingHorizontal: 14,
                  }}
                >
                  <Text
                    style={{
                      color: selected ? "#fff" : "#5f6770",
                      fontWeight: "700",
                    }}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <Text style={{ color: "#3e4a57", fontWeight: "700", marginBottom: 10 }}>
          Prioridade
        </Text>
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 14 }}>
          {priorities.map((item) => {
            const selected = item === prioridadeSelecionada;

            return (
              <TouchableOpacity
                key={item}
                onPress={() => setPrioridadeSelecionada(item)}
                style={{
                  flex: 1,
                  backgroundColor: selected ? priorityColors[item] : "#f1ebe0",
                  borderRadius: 18,
                  paddingVertical: 12,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: selected ? "#fff" : "#5f6770",
                    fontWeight: "800",
                  }}
                >
                  {priorityLabels[item]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={{ color: "#3e4a57", fontWeight: "700", marginBottom: 10 }}>
          Atalhos rapidos
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 16 }}
        >
          <View style={{ flexDirection: "row", gap: 10 }}>
            {quickTemplates.map((item) => (
              <TouchableOpacity
                key={item.titulo}
                onPress={() => aplicarTemplate(item)}
                style={{
                  backgroundColor: "#f8efe2",
                  borderRadius: 18,
                  paddingVertical: 12,
                  paddingHorizontal: 14,
                  width: 190,
                }}
              >
                <Text style={{ color: "#1e2d3d", fontWeight: "700" }}>{item.titulo}</Text>
                <Text style={{ color: "#7b6c58", marginTop: 6 }}>
                  {item.categoria} • {priorityLabels[item.prioridade]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <TouchableOpacity
          onPress={adicionarTarefa}
          style={{
            backgroundColor: "#245d91",
            borderRadius: 18,
            paddingVertical: 16,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "800" }}>
            Adicionar tarefa
          </Text>
        </TouchableOpacity>
      </View>

      <View
        style={{
          backgroundColor: "#fffaf4",
          borderRadius: 26,
          padding: 18,
          borderWidth: 1,
          borderColor: "#eadfce",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 14,
            gap: 12,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 22, fontWeight: "800", color: "#1b2b3d" }}>
              Suas tarefas
            </Text>
            <Text style={{ color: "#6f7a86", marginTop: 4 }}>
              Busca inteligente e filtros rapidos
            </Text>
          </View>

          <View
            style={{
              backgroundColor: modoOffline ? "#fde9cb" : "#e6f4eb",
              borderRadius: 999,
              paddingVertical: 8,
              paddingHorizontal: 12,
            }}
          >
            <Text
              style={{
                color: modoOffline ? "#9b651f" : "#287848",
                fontWeight: "800",
              }}
            >
              {modoOffline ? "Offline" : "Online"}
            </Text>
          </View>
        </View>

        <TextInput
          placeholder="Buscar por titulo, categoria ou observacao"
          placeholderTextColor="#8e98a3"
          value={busca}
          onChangeText={setBusca}
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 18,
            paddingHorizontal: 16,
            paddingVertical: 14,
            borderWidth: 1,
            borderColor: "#e4dccd",
            marginBottom: 14,
          }}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 14 }}>
            {[
              { key: "todas", label: "Todas" },
              { key: "pendentes", label: "Pendentes" },
              { key: "concluidas", label: "Concluidas" },
              { key: "urgentes", label: "Urgentes" },
            ].map((item) => {
              const active = filtro === item.key;

              return (
                <TouchableOpacity
                  key={item.key}
                  onPress={() => setFiltro(item.key as FilterMode)}
                  style={{
                    backgroundColor: active ? "#1d3652" : "#f1ebe0",
                    borderRadius: 999,
                    paddingVertical: 10,
                    paddingHorizontal: 14,
                  }}
                >
                  <Text
                    style={{
                      color: active ? "#fff" : "#58626e",
                      fontWeight: "700",
                    }}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {modoOffline ? (
          <Text style={{ color: "#8a6d3b", marginBottom: 12, lineHeight: 20 }}>
            Modo offline ativo. As tarefas estao sendo salvas no aparelho.
          </Text>
        ) : null}

        {erro ? (
          <Text style={{ color: "#d93025", marginBottom: 12 }}>{erro}</Text>
        ) : null}

        {tarefasFiltradas.length === 0 ? (
          <View
            style={{
              backgroundColor: "#f8efe2",
              borderRadius: 22,
              padding: 20,
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "800", color: "#203246" }}>
              Nada por aqui ainda
            </Text>
            <Text
              style={{
                color: "#6f7a86",
                textAlign: "center",
                marginTop: 8,
                lineHeight: 20,
              }}
            >
              Crie uma nova tarefa, use um atalho rapido ou ajuste os filtros da lista.
            </Text>
          </View>
        ) : (
          tarefasFiltradas.map((item) => (
            <View
              key={item.id}
              style={{
                backgroundColor: item.concluida ? "#f3f0ea" : "#ffffff",
                borderRadius: 22,
                padding: 16,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: "#e8dfd1",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 12,
                }}
              >
                <TouchableOpacity
                  onPress={() => concluirTarefa(item)}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 999,
                    borderWidth: 2,
                    borderColor: item.concluida ? "#4b8f6b" : "#c6d0da",
                    backgroundColor: item.concluida ? "#4b8f6b" : "#fff",
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: 4,
                  }}
                >
                  <Text style={{ color: "#fff", fontWeight: "800", fontSize: 12 }}>
                    {item.concluida ? "OK" : ""}
                  </Text>
                </TouchableOpacity>

                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                    <View
                      style={{
                        backgroundColor: `${categoryColors[item.categoria]}18`,
                        borderRadius: 999,
                        paddingVertical: 6,
                        paddingHorizontal: 10,
                      }}
                    >
                      <Text
                        style={{
                          color: categoryColors[item.categoria],
                          fontWeight: "700",
                          fontSize: 12,
                        }}
                      >
                        {item.categoria}
                      </Text>
                    </View>

                    <View
                      style={{
                        backgroundColor: `${priorityColors[item.prioridade]}18`,
                        borderRadius: 999,
                        paddingVertical: 6,
                        paddingHorizontal: 10,
                      }}
                    >
                      <Text
                        style={{
                          color: priorityColors[item.prioridade],
                          fontWeight: "700",
                          fontSize: 12,
                        }}
                      >
                        {priorityLabels[item.prioridade]}
                      </Text>
                    </View>

                    <View
                      style={{
                        backgroundColor: "#f5efe7",
                        borderRadius: 999,
                        paddingVertical: 6,
                        paddingHorizontal: 10,
                      }}
                    >
                      <Text style={{ color: "#7b6d5a", fontWeight: "700", fontSize: 12 }}>
                        {formatDate(item.criadaEm)}
                      </Text>
                    </View>
                  </View>

                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "800",
                      color: item.concluida ? "#8b939b" : "#1b2b3d",
                      textDecorationLine: item.concluida ? "line-through" : "none",
                    }}
                  >
                    {item.titulo}
                  </Text>

                  {item.observacao ? (
                    <Text
                      style={{
                        color: "#6f7a86",
                        marginTop: 8,
                        lineHeight: 20,
                      }}
                    >
                      {item.observacao}
                    </Text>
                  ) : null}

                  <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
                    <TouchableOpacity
                      onPress={() => concluirTarefa(item)}
                      style={{
                        backgroundColor: item.concluida ? "#eef5f0" : "#eaf0f7",
                        borderRadius: 14,
                        paddingVertical: 10,
                        paddingHorizontal: 14,
                      }}
                    >
                      <Text
                        style={{
                          color: item.concluida ? "#3d7d58" : "#245d91",
                          fontWeight: "700",
                        }}
                      >
                        {item.concluida ? "Reabrir" : "Concluir"}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => deletarTarefa(item.id)}
                      style={{
                        backgroundColor: "#fdeced",
                        borderRadius: 14,
                        paddingVertical: 10,
                        paddingHorizontal: 14,
                      }}
                    >
                      <Text style={{ color: "#b34141", fontWeight: "700" }}>Excluir</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))
        )}
      </View>
    </Animated.ScrollView>
  );
}
