import React from "react";

let cache: any = {};
let listeners: any[] = [];

export function setPermissoes(novas: any[]) {
  cache = {};

  novas.forEach(p => {
    cache[p.slug] = {
      consultar: !!p.pode_consultar,
      criar: !!p.pode_criar,
      editar: !!p.pode_editar,
      excluir: !!p.pode_excluir,
    };
  });

  listeners.forEach(l => l(cache));
}

export function verifyPerm(
  slug: string,
  tipo: "consultar" | "criar" | "editar" | "excluir"
) {
  return !!cache?.[slug]?.[tipo];
}

export function usePerm() {
  const [perms, setPerms] = React.useState({ ...cache });

  React.useEffect(() => {
    const fn = (c: any) => setPerms({ ...c });
    listeners.push(fn);

    return () => {
      listeners = listeners.filter(l => l !== fn);
    };
  }, []);

  return perms;
}

export function useVerify(
  slug: string,
  tipo: "consultar" | "criar" | "editar" | "excluir"
) {
  const perms = usePerm();
  return !!perms?.[slug]?.[tipo];
}

export function SemAcesso({ voltar }: { voltar: () => void }) {
  return (
    <div style={{ padding: 40 }}>
      <h2>🚫 Sem permissão</h2>
      <p>Você não tem acesso a esta área.</p>
      <button onClick={voltar}>Voltar</button>
    </div>
  );
}
