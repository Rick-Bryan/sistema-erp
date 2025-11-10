import pool from './connection.js';
import bcrypt from 'bcryptjs';

/**
 * Lista todos os colaboradores (exceto a senha)
 */
export async function listarColaboradores() {
  const [rows] = await pool.query(`
    SELECT id, nome, email, nivel, setor, ativo, criado_em 
    FROM usuarios 
    ORDER BY id DESC
  `);
  return rows;
}

/**
 * Cria um novo colaborador
 */
export async function criarColaborador({ nome, email, senha, nivel, setor, ativo = 1 }) {
  const senhaHash = await bcrypt.hash(senha, 10);

  const [result] = await pool.query(
    `INSERT INTO usuarios (nome, email, senha, nivel, setor, ativo, criado_em)
     VALUES (?, ?, ?, ?, ?, ?, NOW())`,
    [nome, email, senhaHash, nivel || 'comum', setor, ativo]
  );

  return { id: result.insertId };
}

/**
 * Atualiza um colaborador existente
 */
export async function atualizarColaborador({ id, nome, email, nivel, setor, ativo }) {
  await pool.query(
    'UPDATE usuarios SET nome = ?, email = ?, nivel = ?, setor = ?, ativo = ? WHERE id = ?',
    [nome, email, nivel, setor, ativo, id]
  );
  return true;
}


/**
 * Exclui um colaborador
 */
export async function deletarColaborador(id) {
  await pool.query('DELETE FROM usuarios WHERE id = ?', [id]);
  return true;
}
