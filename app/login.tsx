import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { createUsuario, getUsuarios, setSessionUser } from "@/services/data";

type AuthMode = "login" | "cadastro";

export default function Login() {
  const [modo, setModo] = useState<AuthMode>("login");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const router = useRouter();

  const limparFormulario = () => {
    setNome("");
    setEmail("");
    setSenha("");
    setConfirmarSenha("");
    setMensagem("");
  };

  const alternarModo = (novoModo: AuthMode) => {
    setModo(novoModo);
    limparFormulario();
  };

  const entrar = async () => {
    if (!email.trim() || !senha.trim() || carregando) return;

    try {
      setCarregando(true);
      setMensagem("");

      const { usuarios, offline } = await getUsuarios();
      const usuarioEncontrado = usuarios.find(
        (usuario) =>
          usuario.email === email.trim() && usuario.senha === senha.trim()
      );

      if (!usuarioEncontrado) {
        alert("Email ou senha invalidos");
        return;
      }

      await setSessionUser(usuarioEncontrado);

      if (offline) {
        setMensagem("Modo offline ativo. O app continua funcionando no aparelho.");
      }

      router.replace("/(tabs)");
    } catch (erro) {
      console.log(erro);
      alert("Nao foi possivel fazer login. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  const criarConta = async () => {
    if (!nome.trim() || !email.trim() || !senha.trim() || carregando) return;

    if (senha.length < 3) {
      alert("A senha precisa ter pelo menos 3 caracteres.");
      return;
    }

    if (senha !== confirmarSenha) {
      alert("As senhas nao conferem.");
      return;
    }

    try {
      setCarregando(true);
      setMensagem("");

      const { usuario, offline } = await createUsuario({
        nome,
        email,
        senha,
      });

      await setSessionUser(usuario);

      if (offline) {
        setMensagem("Conta criada em modo offline neste aparelho.");
      }

      router.replace("/(tabs)");
    } catch (erro) {
      if (erro instanceof Error && erro.message === "EMAIL_JA_CADASTRADO") {
        alert("Esse email ja esta cadastrado.");
        return;
      }

      console.log(erro);
      alert("Nao foi possivel criar a conta. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  const recuperarSenha = async () => {
    const emailInformado = email.trim().toLowerCase();

    if (!emailInformado) {
      alert("Digite seu email para recuperar a senha.");
      return;
    }

    const { usuarios } = await getUsuarios();
    const usuarioEncontrado = usuarios.find(
      (usuario) => usuario.email.toLowerCase() === emailInformado
    );

    if (!usuarioEncontrado) {
      alert("Email nao encontrado.");
      return;
    }

    const assunto = encodeURIComponent("Recuperacao de senha - TarefasApp");
    const corpo = encodeURIComponent(
      `Ola ${usuarioEncontrado.nome},\n\nSua senha cadastrada no TarefasApp e: ${usuarioEncontrado.senha}\n\nSe voce nao solicitou esta recuperacao, ignore esta mensagem.`
    );
    const url = `mailto:${usuarioEncontrado.email}?subject=${assunto}&body=${corpo}`;
    const podeAbrirEmail = await Linking.canOpenURL(url);

    if (!podeAbrirEmail) {
      alert(`Senha cadastrada: ${usuarioEncontrado.senha}`);
      return;
    }

    await Linking.openURL(url);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: "#f7f1e8" }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          paddingHorizontal: 22,
          paddingVertical: 32,
        }}
      >
        <View
          style={{
            position: "absolute",
            top: 40,
            right: -20,
            width: 180,
            height: 180,
            borderRadius: 999,
            backgroundColor: "#ffcf8b",
            opacity: 0.35,
          }}
        />
        <View
          style={{
            position: "absolute",
            bottom: 80,
            left: -40,
            width: 160,
            height: 160,
            borderRadius: 999,
            backgroundColor: "#9fc2ff",
            opacity: 0.3,
          }}
        />

        <View
          style={{
            backgroundColor: "#17324d",
            borderRadius: 30,
            padding: 28,
            marginBottom: 18,
            shadowColor: "#17324d",
            shadowOpacity: 0.18,
            shadowRadius: 24,
            shadowOffset: { width: 0, height: 16 },
            elevation: 8,
          }}
        >
          <Text
            style={{
              color: "#ffd59e",
              fontSize: 13,
              letterSpacing: 1.2,
              textTransform: "uppercase",
              marginBottom: 14,
              fontWeight: "700",
            }}
          >
            Organize seu dia
          </Text>

          <Text
            style={{
              color: "#fffaf1",
              fontSize: 34,
              lineHeight: 40,
              fontWeight: "800",
              marginBottom: 12,
            }}
          >
            Entrar no painel de tarefas
          </Text>

          <Text
            style={{
              color: "#c8d5e2",
              fontSize: 15,
              lineHeight: 24,
            }}
          >
            Um visual mais moderno, tarefas mais inteligentes e um fluxo pronto
            para funcionar online ou offline.
          </Text>

          <View
            style={{
              marginTop: 22,
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            {["Busca rapida", "Prioridades", "Resumo diario"].map((item) => (
              <View
                key={item}
                style={{
                  backgroundColor: "rgba(255,255,255,0.12)",
                  borderRadius: 999,
                  paddingVertical: 9,
                  paddingHorizontal: 14,
                }}
              >
                <Text style={{ color: "#f3f7fb", fontWeight: "600" }}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        <View
          style={{
            backgroundColor: "#fffaf4",
            borderRadius: 28,
            padding: 22,
            borderWidth: 1,
            borderColor: "#f0e0c8",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 18,
            }}
          >
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={{ fontSize: 24, fontWeight: "800", color: "#16253a" }}>
                {modo === "login" ? "Login" : "Criar conta"}
              </Text>
              <Text style={{ color: "#6f7a86", marginTop: 4 }}>
                {modo === "login"
                  ? "Entre com a sua conta para acessar o painel."
                  : "Cadastre seus dados para acessar o app."}
              </Text>
            </View>
          </View>

          <View
            style={{
              flexDirection: "row",
              backgroundColor: "#f1ebe0",
              borderRadius: 18,
              padding: 4,
              marginBottom: 18,
            }}
          >
            <TouchableOpacity
              onPress={() => alternarModo("login")}
              style={{
                flex: 1,
                backgroundColor: modo === "login" ? "#245d91" : "transparent",
                borderRadius: 14,
                paddingVertical: 11,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: modo === "login" ? "#fff" : "#5f6770",
                  fontWeight: "800",
                }}
              >
                Entrar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => alternarModo("cadastro")}
              style={{
                flex: 1,
                backgroundColor: modo === "cadastro" ? "#245d91" : "transparent",
                borderRadius: 14,
                paddingVertical: 11,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: modo === "cadastro" ? "#fff" : "#5f6770",
                  fontWeight: "800",
                }}
              >
                Criar conta
              </Text>
            </TouchableOpacity>
          </View>

          {modo === "cadastro" ? (
            <>
              <Text style={{ color: "#3d4b5b", fontWeight: "700", marginBottom: 8 }}>
                Nome
              </Text>
              <TextInput
                placeholder="Digite seu nome"
                placeholderTextColor="#8e98a3"
                value={nome}
                onChangeText={setNome}
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: 18,
                  paddingHorizontal: 16,
                  paddingVertical: 15,
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: "#e4dccd",
                  color: "#182332",
                }}
              />
            </>
          ) : null}

          <Text style={{ color: "#3d4b5b", fontWeight: "700", marginBottom: 8 }}>
            Email
          </Text>
          <TextInput
            placeholder="Digite seu email"
            placeholderTextColor="#8e98a3"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 18,
              paddingHorizontal: 16,
              paddingVertical: 15,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: "#e4dccd",
              color: "#182332",
            }}
          />

          <Text style={{ color: "#3d4b5b", fontWeight: "700", marginBottom: 8 }}>
            Senha
          </Text>
          <TextInput
            placeholder="Digite sua senha"
            placeholderTextColor="#8e98a3"
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 18,
              paddingHorizontal: 16,
              paddingVertical: 15,
              marginBottom: 18,
              borderWidth: 1,
              borderColor: "#e4dccd",
              color: "#182332",
            }}
          />

          {modo === "cadastro" ? (
            <>
              <Text style={{ color: "#3d4b5b", fontWeight: "700", marginBottom: 8 }}>
                Confirmar senha
              </Text>
              <TextInput
                placeholder="Digite a senha novamente"
                placeholderTextColor="#8e98a3"
                secureTextEntry
                value={confirmarSenha}
                onChangeText={setConfirmarSenha}
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: 18,
                  paddingHorizontal: 16,
                  paddingVertical: 15,
                  marginBottom: 18,
                  borderWidth: 1,
                  borderColor: "#e4dccd",
                  color: "#182332",
                }}
              />
            </>
          ) : null}

          {modo === "login" ? (
            <TouchableOpacity
              onPress={recuperarSenha}
              style={{
                alignSelf: "flex-end",
                marginBottom: 16,
              }}
            >
              <Text style={{ color: "#245d91", fontWeight: "800" }}>
                Esqueci minha senha
              </Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            onPress={modo === "login" ? entrar : criarConta}
            disabled={carregando}
            style={{
              backgroundColor: carregando ? "#5e8ab7" : "#245d91",
              borderRadius: 18,
              paddingVertical: 16,
              alignItems: "center",
              shadowColor: "#245d91",
              shadowOpacity: 0.2,
              shadowRadius: 14,
              shadowOffset: { width: 0, height: 10 },
              elevation: 4,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>
              {carregando
                ? "Aguarde..."
                : modo === "login"
                  ? "Entrar no painel"
                  : "Criar conta"}
            </Text>
          </TouchableOpacity>

          {mensagem ? (
            <Text
              style={{
                marginTop: 14,
                textAlign: "center",
                color: "#7a5b2d",
                lineHeight: 20,
              }}
            >
              {mensagem}
            </Text>
          ) : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
