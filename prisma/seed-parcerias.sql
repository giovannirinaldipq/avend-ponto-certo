-- Parcerias Gerais (fornecedores/marcas)
INSERT OR IGNORE INTO Parceria (id, tipo, nomeEmpresa, nomeContato, email, telefone, descricao, numUnidades, indicadorId, status, createdAt, updatedAt) VALUES
('parc01', 'GERAL', 'Bold Snacks', 'Ricardo Menezes', 'ricardo@boldsnacks.com.br', '(11) 3045-8900', 'Interesse em distribuir barras proteicas e snacks saudaveis nas maquinas da rede AVEND em academias e empresas.', NULL, NULL, 'ATIVO', datetime('now', '-45 days'), datetime('now')),
('parc02', 'GERAL', 'Cimed Farmaceutica', 'Juliana Tavares', 'juliana.tavares@cimed.com.br', '(11) 4002-1500', 'Proposta para vending machines com produtos OTC (vitaminas, analgesicos, hidratantes) em hospitais e clinicas.', NULL, NULL, 'NEGOCIACAO', datetime('now', '-30 days'), datetime('now')),
('parc03', 'GERAL', 'Coca-Cola FEMSA', 'Andre Nakamura', 'andre.nakamura@coca-cola.com', '(11) 3555-7000', 'Parceria para fornecimento exclusivo de bebidas em maquinas instaladas em universidades e coworkings.', NULL, NULL, 'CONTRATO', datetime('now', '-20 days'), datetime('now')),
('parc04', 'GERAL', 'Bauducco', 'Fernanda Lopes', 'fernanda.lopes@bauducco.com.br', '(11) 2199-3000', 'Interesse em colocar linha de snacks e bolachas nas maquinas. Foco em empresas e industrias.', NULL, 'captador001', 'CONTATO', datetime('now', '-12 days'), datetime('now')),
('parc05', 'GERAL', 'Cafe Tres Coracoes', 'Marcos Vieira', 'marcos@trescoracoes.com.br', '(85) 3878-6000', 'Proposta de capsulas e cafe pronto para maquinas em escritorios e coworkings.', NULL, 'captador001', 'NOVO', datetime('now', '-5 days'), datetime('now')),
('parc06', 'GERAL', 'Mondelez (Lacta/Bis)', 'Patricia Almeida', 'patricia.almeida@mdlz.com', '(41) 3341-5000', 'Chocolates e snacks para maquinas em shoppings, cinemas e universidades.', NULL, NULL, 'NOVO', datetime('now', '-3 days'), datetime('now'));

-- Parcerias de Redes (pontos escalaveis)
INSERT OR IGNORE INTO Parceria (id, tipo, nomeEmpresa, nomeContato, email, telefone, descricao, numUnidades, indicadorId, status, createdAt, updatedAt) VALUES
('parc07', 'REDE', 'SmartFit', 'Gustavo Borges', 'gustavo.borges@smartfit.com', '(11) 3500-9000', 'Rede de academias com interesse em maquinas de snacks saudaveis e bebidas isotônicas em todas as unidades SP e PR.', 85, NULL, 'ATIVO', datetime('now', '-60 days'), datetime('now')),
('parc08', 'REDE', 'Rede Unimed Paulistana', 'Dra. Camila Rocha', 'camila.rocha@unimed.com.br', '(11) 3113-2000', 'Hospitais e clinicas da rede Unimed em SP. Interesse em snacks, bebidas e itens de conveniencia para visitantes e funcionarios.', 32, NULL, 'CONTRATO', datetime('now', '-40 days'), datetime('now')),
('parc09', 'REDE', 'Rede DOr Sao Luiz', 'Felipe Monteiro', 'felipe.monteiro@rededorsaoluiz.com.br', '(21) 2545-3000', 'Maior rede hospitalar do Brasil. Piloto inicial com 5 unidades em SP, expansao para RJ e MG.', 120, NULL, 'NEGOCIACAO', datetime('now', '-25 days'), datetime('now')),
('parc10', 'REDE', 'Skyfit Academia', 'Rodrigo Penna', 'rodrigo@skyfit.com.br', '(11) 4200-8800', 'Rede de academias premium. Interesse em maquinas com mix saudavel e suplementos.', 45, 'captador001', 'CONTATO', datetime('now', '-15 days'), datetime('now')),
('parc11', 'REDE', 'Anhanguera Educacional', 'Coord. Silvia Martins', 'silvia.martins@anhanguera.com', '(11) 3512-4000', 'Rede de faculdades com campus em todo o Brasil. Piloto em 10 unidades de SP.', 200, NULL, 'NOVO', datetime('now', '-8 days'), datetime('now')),
('parc12', 'REDE', 'Rede Accor (Ibis/Novotel)', 'Laurent Dubois', 'laurent.dubois@accor.com', '(11) 3702-8000', 'Hoteis da rede Accor no Brasil. Maquinas em lobbies e areas de convivencia.', 60, 'captador001', 'NOVO', datetime('now', '-2 days'), datetime('now'));

-- Unidades liberadas pela SmartFit (parceria ativa)
INSERT OR IGNORE INTO UnidadeRede (id, parceriaId, nome, endereco, cidade, estado, indicacaoId, createdAt) VALUES
('uni01', 'parc07', 'SmartFit Paulista', 'Av. Paulista, 1230', 'Sao Paulo', 'SP', NULL, datetime('now', '-30 days')),
('uni02', 'parc07', 'SmartFit Moema', 'Av. Moema, 450', 'Sao Paulo', 'SP', NULL, datetime('now', '-30 days')),
('uni03', 'parc07', 'SmartFit Pinheiros', 'Rua dos Pinheiros, 1100', 'Sao Paulo', 'SP', NULL, datetime('now', '-25 days')),
('uni04', 'parc07', 'SmartFit Curitiba Centro', 'Rua XV de Novembro, 800', 'Curitiba', 'PR', NULL, datetime('now', '-20 days')),
('uni05', 'parc07', 'SmartFit Curitiba Batel', 'Av. do Batel, 1500', 'Curitiba', 'PR', NULL, datetime('now', '-20 days')),
('uni06', 'parc07', 'SmartFit Campinas', 'Av. Norte-Sul, 300', 'Campinas', 'SP', NULL, datetime('now', '-15 days'));