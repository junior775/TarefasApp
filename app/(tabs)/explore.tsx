import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";

import { getSessionUser, getTarefas, Tarefa } from "@/services/data";

const tips = [
  "Comece pelas tarefas de prioridade alta logo no inicio do dia.",
  "Agrupe tarefas parecidas para reduzir troca de contexto.",
  "Use observacoes curtas para registrar proximos passos claros.",
];

const focusBlocks = [
  { title: "Sprint 25 min", description: "Ideal para tarefas rapidas e objetivas." },
  { title: "Bloco 50 min", description: "Bom para estudos e entregas mais profundas." },
  { title: "Revisao 10 min", description: "Feche o dia limpando pequenas pendencias." },
];

export default function ExploreScreen() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [nome, setNome] = useState("Emerson");
  const [modoOffline, setModoOffline] = useState(false);

  useEffect(() => {
    const carregarDados = async () => {
      const usuario = await getSessionUser();
      const { tarefas: lista, offline } = await getTarefas();

      if (usuario?.nome) {
        setNome(usuario.nome);
      }

      setTarefas(lista);
      setModoOffline(offline);
    };

    carregarDados();
  }, []);

  const pendentes = tarefas.filter((item) => !item.concluida);
  const concluidas = tarefas.filter((item) => item.concluida);
  const urgentes = tarefas.filter(
    (item) => item.prioridade === "alta" && !item.concluida
  );

  const categorySummary = ["Trabalho", "Estudo", "Casa", "Saude", "Pessoal"].map(
    (categoria) => ({
      categoria,
      total: tarefas.filter((item) => item.categoria === categoria).length,
    })
  );

  const topCategory =
    [...categorySummary].sort((a, b) => b.total - a.total)[0]?.categoria ||
    "Pessoal";

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#f5efe7" }}
      contentContainerStyle={{ padding: 18, paddingBottom: 38 }}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={{
          backgroundColor: "#4a2f58",
          borderRadius: 30,
          padding: 24,
          marginBottom: 18,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            position: "absolute",
            right: -26,
            top: -26,
            width: 130,
            height: 130,
            borderRadius: 999,
            backgroundColor: "#f5b55f",
            opacity: 0.24,
          }}
        />
        <Text style={{ color: "#f7d8ff", fontWeight: "700", marginBottom: 10 }}>
          Resumo de produtividade
        </Text>
        <Text
          style={{
            color: "#fff9ff",
            fontSize: 28,
            fontWeight: "800",
            lineHeight: 34,
          }}
        >
          {nome}, veja como seu ritmo esta hoje
        </Text>
        <Text style={{ color: "#ead7ef", marginTop: 10, lineHeight: 22 }}>
          Use este painel para observar equilibrio entre foco, execucao e volume
          de tarefas.
        </Text>

        <View
          style={{
            marginTop: 20,
            flexDirection: "row",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          {[
            { label: "Pendentes", value: pendentes.length },
            { label: "Concluidas", value: concluidas.length },
            { label: "Urgentes", value: urgentes.length },
          ].map((item) => (
            <View
              key={item.label}
              style={{
                backgroundColor: "rgba(255,255,255,0.13)",
                borderRadius: 18,
                paddingVertical: 12,
                paddingHorizontal: 14,
                minWidth: 100,
              }}
            >
              <Text style={{ color: "#efe2f4", marginBottom: 6 }}>{item.label}</Text>
              <Text style={{ color: "#fff", fontWeight: "800", fontSize: 20 }}>
                {item.value}
              </Text>
            </View>
          ))}
        </View>
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
        <Text style={{ fontSize: 21, fontWeight: "800", color: "#1b2b3d" }}>
          Diagnostico rapido
        </Text>

        <View
          style={{
            marginTop: 14,
            backgroundColor: "#f7efe1",
            borderRadius: 20,
            padding: 16,
          }}
        >
          <Text style={{ color: "#6f7a86", marginBottom: 6 }}>Categoria dominante</Text>
          <Text style={{ fontSize: 20, fontWeight: "800", color: "#1e2d3d" }}>
            {topCategory}
          </Text>
        </View>

        <View
          style={{
            marginTop: 14,
            backgroundColor: modoOffline ? "#fde9cb" : "#e6f4eb",
            borderRadius: 18,
            padding: 14,
          }}
        >
          <Text
            style={{
              color: modoOffline ? "#9b651f" : "#287848",
              fontWeight: "800",
            }}
          >
            {modoOffline
              ? "Modo offline ativo neste dispositivo."
              : "Sincronizacao com backend ativa."}
          </Text>
        </View>
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
        <Text style={{ fontSize: 21, fontWeight: "800", color: "#1b2b3d" }}>
          Distribuicao por categoria
        </Text>

        <View style={{ marginTop: 16, gap: 12 }}>
          {categorySummary.map((item) => (
            <View key={item.categoria}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <Text style={{ color: "#344252", fontWeight: "700" }}>{item.categoria}</Text>
                <Text style={{ color: "#6f7a86" }}>{item.total}</Text>
              </View>
              <View
                style={{
                  height: 10,
                  borderRadius: 999,
                  backgroundColor: "#efe7db",
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    width: `${tarefas.length === 0 ? 0 : (item.total / tarefas.length) * 100}%`,
                    height: "100%",
                    borderRadius: 999,
                    backgroundColor: "#245d91",
                  }}
                />
              </View>
            </View>
          ))}
        </View>
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
        <Text style={{ fontSize: 21, fontWeight: "800", color: "#1b2b3d" }}>
          Sugestoes para render mais
        </Text>

        <View style={{ marginTop: 14, gap: 12 }}>
          {tips.map((item) => (
            <View
              key={item}
              style={{
                backgroundColor: "#f8efe2",
                borderRadius: 18,
                padding: 14,
              }}
            >
              <Text style={{ color: "#334152", lineHeight: 22 }}>{item}</Text>
            </View>
          ))}
        </View>
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
        <Text style={{ fontSize: 21, fontWeight: "800", color: "#1b2b3d" }}>
          Blocos de foco
        </Text>

        <View style={{ marginTop: 14, gap: 12 }}>
          {focusBlocks.map((item) => (
            <View
              key={item.title}
              style={{
                backgroundColor: "#f4f0fa",
                borderRadius: 20,
                padding: 16,
              }}
            >
              <Text style={{ fontSize: 17, fontWeight: "800", color: "#472f65" }}>
                {item.title}
              </Text>
              <Text style={{ color: "#68597d", marginTop: 6, lineHeight: 21 }}>
                {item.description}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
