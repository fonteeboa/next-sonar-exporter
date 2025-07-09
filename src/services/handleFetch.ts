import axios from "axios";
import type { Project, FetchProjectsParams } from "@/types";

export const fetchProjects = async ({
  orgKey,
  token,
  addToast,
}: FetchProjectsParams): Promise<{ projects: Project[] } | { error: string }> => {
  if (!orgKey || !token) {
    return { error: "Organização e token são obrigatórios" };
  }

  try {
    const res = await axios.get(`/api/sonar-projects?orgKey=${orgKey}&token=${token}`);

    if (res.status !== 200) {
      throw new Error(`Erro ao buscar projetos: ${res.statusText}`);
    }

    const list: Project[] = res.data.components;

    if (list.length === 0) {
      addToast?.({
        title: "Nenhum projeto encontrado",
        text: "Verifique se a organização está correta e se você tem acesso aos projetos",
        color: "warning",
        iconType: "iInCircle",
      });
      return { projects: [] };
    }

    addToast?.({
      title: "Sucesso!",
      text: `${list.length} projeto${list.length > 1 ? "s" : ""} encontrado${list.length > 1 ? "s" : ""}`,
      color: "success",
      iconType: "check",
    });

    return { projects: list };
  } catch (e: any) {
    console.error("Erro ao buscar projetos:", e);

    const errorMessage =
      axios.isAxiosError(e) && e.response?.status === 401
        ? "Token inválido ou sem permissão"
        : "Erro de conexão. Verifique sua rede e tente novamente";

    addToast?.({
      title: "Ops! Algo deu errado 😕",
      text: errorMessage,
      color: "danger",
      iconType: "alert",
    });

    return { error: errorMessage };
  }
};
