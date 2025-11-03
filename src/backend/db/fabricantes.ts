import pool from './connection'

export interface Fabricante {
    CodigoFabricante?: number,
    NomeFabricante?: string,
    Ativo?: boolean

}

export async function listarFabricantes(): Promise<Fabricante[]> {
    const [rows] = await pool.query<Fabricante[]>('SELECT * FROM produto_fabricante ORDER BY CodigoFabricante')
    return rows;
}
export async function criarFabricante(fabricante: Fabricante) {
    const sql = `
        INSERT INTO produto_fabricante (NomeFabricante, Ativo)
        VALUES (?,?)
    `
    await pool.execute(sql, [
        fabricante.NomeFabricante ?? null, // substitui undefined por null
        fabricante.Ativo != null ? fabricante.Ativo : 0 // ou null, se quiser
    ]);

}