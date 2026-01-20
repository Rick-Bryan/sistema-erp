import toast from "react-hot-toast";
export function toastErro(err: any, padrao = "Preencha todos os campos corretamente") {
  let msg = err?.message || padrao;

  msg = msg.replace(/^Error invoking remote method '.*?':\s*Error:\s*/i, "");

  if (!msg || msg.toLowerCase().includes("error")) {
    msg = padrao;
  }

  toast.error(msg);
}
