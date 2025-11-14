// src/pages/cadastros/CadastrosPage.tsx
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Package, Factory, Layers, Boxes, User, Users } from 'lucide-react';

interface CadastrosAuxiliaresProps {
    setPage: (page: string) => void;
}

export default function CadastrosAuxiliares({ setPage }: CadastrosAuxiliaresProps) {
    return (
        <div style={{ padding: 24 }}>
            <h1 style={{ fontSize: 24, marginBottom: 16, color: '#1e3a8a' }}>Cadastros Auxiliares</h1>
            <h1 style={{ fontSize: 24, marginBottom: 16, marginTop: 16, color: '#1e3a8a' }}>Pessoas</h1>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: 16
            }}>
                <Card onClick={() => setPage('produtos')} className="cursor-pointer">
                    <CardHeader>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Package style={{ width: 28, height: 28 }} />
                            <strong>Produtos</strong>
                        </div>
                    </CardHeader>
                    <CardContent>Gerencie o cadastro de produtos</CardContent>
                </Card>

                <Card onClick={() => setPage('fabricantes')} className="cursor-pointer">
                    <CardHeader>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Factory style={{ width: 28, height: 28 }} />
                            <strong>Fabricantes</strong>
                        </div>
                    </CardHeader>
                    <CardContent>Cadastre e edite fabricantes</CardContent>
                </Card>
                <Card onClick={() => setPage('clientes')} className="cursor-pointer">
                    <CardHeader>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Users style={{ width: 28, height: 28 }} />
                            <strong>Clientes</strong>
                        </div>
                    </CardHeader>
                    <CardContent>Cadastre e edite Clientes</CardContent>
                </Card>
                <Card onClick={() => setPage('colaboradores')} className="cursor-pointer">
                    <CardHeader>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Users style={{ width: 28, height: 28 }} />
                            <strong>Colaboradores</strong>
                        </div>
                    </CardHeader>
                    <CardContent>Cadastre e edite Colaboradores</CardContent>
                </Card>
                <Card onClick={() => setPage('colaboradores')} className="cursor-pointer">
                    <CardHeader>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Users style={{ width: 28, height: 28 }} />
                            <strong>Cadastros auxiliares</strong>
                        </div>
                    </CardHeader>
                    <CardContent>Outras alternativas de cadastros</CardContent>
                </Card>
                <Card onClick={() => setPage('fornecedores')} className="cursor-pointer">
                    <CardHeader>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Users style={{ width: 28, height: 28 }} />
                            <strong>Fornecedores</strong>
                        </div>
                    </CardHeader>
                    <CardContent>Outras alternativas de cadastros</CardContent>
                </Card>
                {/* adicione mais cards */}
            </div>
            <h1 style={{ fontSize: 24, marginBottom: 16, color: '#1e3a8a' }}>Produtos</h1>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: 16
            }}>
                <Card onClick={() => setPage('produtos')} className="cursor-pointer">
                    <CardHeader>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Package style={{ width: 28, height: 28 }} />
                            <strong>Produtos</strong>
                        </div>
                    </CardHeader>
                    <CardContent>Gerencie o cadastro de produtos</CardContent>
                </Card>

                <Card onClick={() => setPage('fabricantes')} className="cursor-pointer">
                    <CardHeader>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Factory style={{ width: 28, height: 28 }} />
                            <strong>Fabricantes</strong>
                        </div>
                    </CardHeader>
                    <CardContent>Cadastre e edite fabricantes</CardContent>
                </Card>
                <Card onClick={() => setPage('clientes')} className="cursor-pointer">
                    <CardHeader>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Users style={{ width: 28, height: 28 }} />
                            <strong>Clientes</strong>
                        </div>
                    </CardHeader>
                    <CardContent>Cadastre e edite Clientes</CardContent>
                </Card>
                <Card onClick={() => setPage('colaboradores')} className="cursor-pointer">
                    <CardHeader>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Users style={{ width: 28, height: 28 }} />
                            <strong>Colaboradores</strong>
                        </div>
                    </CardHeader>
                    <CardContent>Cadastre e edite Colaboradores</CardContent>
                </Card>
                <Card onClick={() => setPage('colaboradores')} className="cursor-pointer">
                    <CardHeader>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Users style={{ width: 28, height: 28 }} />
                            <strong>Cadastros auxiliares</strong>
                        </div>
                    </CardHeader>
                    <CardContent>Outras alternativas de cadastros</CardContent>
                </Card>
                <Card onClick={() => setPage('fornecedores')} className="cursor-pointer">
                    <CardHeader>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Users style={{ width: 28, height: 28 }} />
                            <strong>Fornecedores</strong>
                        </div>
                    </CardHeader>
                    <CardContent>Outras alternativas de cadastros</CardContent>
                </Card>
                {/* adicione mais cards */}
            </div>

            <h1 style={{ fontSize: 24, marginBottom: 16, color: '#1e3a8a' }}>Outros</h1>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: 16
            }}>
                <Card onClick={() => setPage('produtos')} className="cursor-pointer">
                    <CardHeader>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Package style={{ width: 28, height: 28 }} />
                            <strong>Produtos</strong>
                        </div>
                    </CardHeader>
                    <CardContent>Gerencie o cadastro de produtos</CardContent>
                </Card>

                <Card onClick={() => setPage('fabricantes')} className="cursor-pointer">
                    <CardHeader>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Factory style={{ width: 28, height: 28 }} />
                            <strong>Fabricantes</strong>
                        </div>
                    </CardHeader>
                    <CardContent>Cadastre e edite fabricantes</CardContent>
                </Card>
                <Card onClick={() => setPage('clientes')} className="cursor-pointer">
                    <CardHeader>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Users style={{ width: 28, height: 28 }} />
                            <strong>Clientes</strong>
                        </div>
                    </CardHeader>
                    <CardContent>Cadastre e edite Clientes</CardContent>
                </Card>
                <Card onClick={() => setPage('colaboradores')} className="cursor-pointer">
                    <CardHeader>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Users style={{ width: 28, height: 28 }} />
                            <strong>Colaboradores</strong>
                        </div>
                    </CardHeader>
                    <CardContent>Cadastre e edite Colaboradores</CardContent>
                </Card>
                <Card onClick={() => setPage('colaboradores')} className="cursor-pointer">
                    <CardHeader>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Users style={{ width: 28, height: 28 }} />
                            <strong>Cadastros auxiliares</strong>
                        </div>
                    </CardHeader>
                    <CardContent>Outras alternativas de cadastros</CardContent>
                </Card>
                <Card onClick={() => setPage('fornecedores')} className="cursor-pointer">
                    <CardHeader>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Users style={{ width: 28, height: 28 }} />
                            <strong>Fornecedores</strong>
                        </div>
                    </CardHeader>
                    <CardContent>Outras alternativas de cadastros</CardContent>
                </Card>
                {/* adicione mais cards */}
            </div>
        </div>

    );
}
