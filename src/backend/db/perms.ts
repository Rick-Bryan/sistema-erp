import pool from "./connection.js";

export async function checkPermissaoPorSlug({
  usuario_id,
  slug,
  acao = "consultar",
}) {
  if (!usuario_id) {
    throw new Error("Usuário não identificado");
  }

  if (!slug) {
    throw new Error("Módulo não identificado");
  }

  const [rows] = await pool.query(
    `
    SELECT 
      pu.pode_consultar,
      pu.pode_criar,
      pu.pode_editar,
      pu.pode_excluir
    FROM permissoes_usuario pu
    JOIN submodulos s ON s.id = pu.submodulo_id
    WHERE pu.usuario_id = ?
      AND s.slug = ?
      AND s.ativo = 1
    LIMIT 1
    `,
    [usuario_id, slug]
  );

  if (!rows.length) {
    throw new Error("Você não possui permissão para este módulo");
  }

  const perm = rows[0];

  const map = {
    consultar: "pode_consultar",
    criar: "pode_criar",
    editar: "pode_editar",
    excluir: "pode_excluir",
  };

  const coluna = map[acao];

  if (!coluna) {
    throw new Error(`Ação inválida: ${acao}`);
  }

  if (!perm[coluna]) {
    throw new Error(`Sem permissão para ${acao} | Finalizar ação`);
  }

  return true;
}
