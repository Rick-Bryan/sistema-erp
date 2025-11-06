import pool from './connection.js';

/** 
 * Lista todos os colaboradores 
 */
export async function listarColaboradores() {
  const [rows] = await pool.query('SELECT * FROM usuarios ORDER BY id DESC');
  return rows;
}

/** 
 * Cria um novo colaborador 
 */
export async function criarColaborador({ nome, email, senha, nivel }) {
  // Gera o hash da senha
  const bcrypt = await import('bcryptjs');
  const senhaHash = await bcrypt.hash(senha, 10);

  const [result] = await pool.query(
    'INSERT INTO usuarios (nome, email, senha, nivel) VALUES (?, ?, ?, ?)',
    [nome, email, senhaHash, nivel || 'comum']
  );

  return { id: result.insertId };
}

/** 
 * Atualiza um colaborador existente 
 */
export async function atualizarColaborador({ id, nome, email, nivel }) {
  await pool.query(
    'UPDATE usuarios SET nome = ?, email = ?, nivel = ? WHERE id = ?',
    [nome, email, nivel, id]
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
