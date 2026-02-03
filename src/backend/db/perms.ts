import pool from './connection.js';

export async function checkPermissaoPorSlug({
  usuario_id,
  slug,
  acao = "usar"
}) {
  const [rows] = await pool.query(
    `
    SELECT 
      pu.pode_consultar,
      pu.pode_usar
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

  if (acao === "consultar" && !perm.pode_consultar) {
    throw new Error("Sem permissão para consultar");
  }

  if (acao === "usar" && !perm.pode_usar) {
    throw new Error("Sem permissão para executar esta ação");
  }

  return true;
}
