import toast from "react-hot-toast";

export function toastErro(err: any, padrao = "Preencha todos os campos corretamente") {
  let msg =
    err?.message ||
    err?.toString?.() ||
    padrao;

  msg = msg.replace(/^Error invoking remote method '.*?':\s*Error:\s*/i, "");

  if (!msg || msg.trim() === "" || msg.toLowerCase().startsWith("error")) {
    msg = padrao;
  }

  toast.error(msg);
}
