# Bento-Box

O **Bento-Box** é um aplicativo voltado para o gerenciamento prático de receitas. A plataforma permite que os usuários organizem seu cardápio, acompanhem seu histórico alimentar, salvem receitas favoritas e encontrem dicas valiosas de alimentação.

---

# 📋 Product Backlog

Este backlog define as funcionalidades planejadas, organizadas por categorias (Épicos), prioridade e nível de dificuldade técnica.

---

### 1. Onboarding e Acesso (Core)
| ID | User Story | Prioridade | Dificuldade |
| :-- | :--- | :--- | :--- |
| BB01 | **Tutorial Interativo:** Como novo usuário, quero um guia rápido para entender as funções principais e definir minhas preferências. | Alta | Média |
| BB02 | **Cadastro de Usuário:** Como usuário, quero criar uma conta para sincronizar meus dados entre dispositivos. | Muito Alta | Média |
| BB03 | **Login Biométrico:** Como usuário, quero acessar o app via digital/face ID para maior agilidade e segurança. | Alta | Média |

### 2. Gestão de Receitas
| ID | User Story | Prioridade | Dificuldade |
| :-- | :--- | :--- | :--- |
| BB04 | **Cadastro de Receita:** Como cozinheiro, quero criar minhas próprias receitas com fotos, ingredientes e passos. | Muito Alta | Média |
| BB05 | **Feed e Filtros:** Como usuário, quero buscar receitas por categorias, tempo de preparo e nível de dificuldade. | Muito Alta | Baixa |
| BB06 | **Visualização Detalhada:** Como cozinheiro, quero visualizar os detalhes da receita de forma clara durante o preparo. | Muito Alta | Baixa |
| BB07 | **Favoritos e Coleções:** Como usuário, quero salvar receitas em pastas personalizadas (ex: "Jantar Romântico"). | Muito Alta | Média |
| BB08 | **Histórico e Avaliação:** Como usuário, quero marcar receitas como feitas e salvá-las no meu histórico com uma nota. | Média | Média |
| BB09 | **Versioneamento:** Como autor, quero manter um histórico de versões das minhas receitas para poder reverter alterações. | Baixa | Difícil |

### 3. Experiência na Cozinha (Hands-on)
| ID | User Story | Prioridade | Dificuldade |
| :-- | :--- | :--- | :--- |
| BB10 | **Timers Simultâneos:** Como cozinheiro, quero múltiplos cronômetros para diferentes etapas da receita. | Alta | Média |
| BB11 | **Navegação Hands-free:** Como cozinheiro, quero navegar pelos passos da receita usando gestos de proximidade. | Baixa | Difícil |
| BB12 | **Conversor de Medidas:** Como usuário, quero realizar conversões de unidades de medida dentro do app. | Média | Baixa |
| BB13 | **Modo Offline:** Como cozinheiro, quero baixar receitas completas para consultar sem conexão com a internet. | Média | Difícil |

### 4. Inteligência, Despensa e Compras
| ID | User Story | Prioridade | Dificuldade |
| :-- | :--- | :--- | :--- |
| BB14 | **Despensa Virtual:** Como usuário, quero cadastrar meus ingredientes para receber sugestões baseadas no que já possuo. | Alta | Difícil |
| BB15 | **Cardápio Semanal:** Como planejador, quero sugestões de cardápio baseadas no meu perfil e restrições alimentares. | Média | Difícil |
| BB16 | **Lista de Compras Inteligente:** Como usuário, quero gerar uma lista automática baseada no meu planejamento semanal. | Média | Média |
| BB17 | **Scanner de Produtos:** Como comprador, quero ler códigos de barras para adicionar itens rapidamente à lista. | Baixa | Difícil |
| BB18 | **Comparação de Preços:** Como comprador, quero comparar o valor da minha lista em mercados próximos via GPS. | Baixa | Difícil |
| BB19 | **Compartilhamento de Lista:** Como usuário, quero enviar minha lista de compras para outros usuários (colaborativo). | Baixa | Difícil |

### 5. Social e Engajamento
| ID | User Story | Prioridade | Dificuldade |
| :-- | :--- | :--- | :--- |
| BB20 | **Compartilhamento de Link:** Como usuário, quero gerar links que levem direto para uma receita específica no app. | Média | Difícil |
| BB21 | **Quizzes e Desafios:** Como entusiasta, quero participar de desafios culinários e quizzes para ganhar badges. | Baixa | Média |
| BB22 | **Integração Climática:** Como usuário, quero sugestões de pratos baseadas na previsão do tempo local. | Baixa | Média |
| BB23 | **Relatório Nutricional:** Como usuário, quero visualizar uma estimativa nutricional por porção da receita. | Baixa | Difícil |

### 6. Infraestrutura e UX
| ID | User Story | Prioridade | Dificuldade |
| :-- | :--- | :--- | :--- |
| BB24 | **Backup Cloud:** Como usuário, quero que meus dados sejam salvos automaticamente no Google Drive. | Baixa | Difícil |
| BB25 | **Modo Escuro Automático:** Como usuário, quero que o app adapte o brilho e cores conforme a iluminação local. | Baixa | Baixa |
| BB26 | **Notificações:** Como usuário, quero ser lembrado das minhas refeições planejadas e receber dicas de aproveitamento. | Média | Média |

---

## 🏃 Backlog da Sprint (Sprint 1 - Fundações e Acesso)
*Refere-se à lista de tarefas concluídas na Sprint 1, focadas em estruturar o acesso de usuários e o fluxo básico de receitas.*

### ✅ Entregues na Sprint 1
| ID | User Story | Prioridade | Dificuldade |
| :-- | :--- | :--- | :--- |
| BB02 | **Cadastro de Usuário:** Como usuário, quero criar uma conta para sincronizar meus dados entre dispositivos. | Muito Alta | Média |
| BB03 | **Login de Usuário:** Como usuário, quero acessar o app com minhas credenciais para maior agilidade e segurança. *(Login implementado via credenciais; autenticação biométrica prevista para versão futura.)* | Alta | Média |
| BB04 | **Cadastro de Receita:** Como cozinheiro, quero criar minhas próprias receitas com fotos, ingredientes e passos. | Muito Alta | Média |
| BB05 | **Feed e Filtros:** Como usuário, quero buscar receitas por categorias, tempo de preparo e nível de dificuldade. | Muito Alta | Baixa |
| BB06 | **Visualização Detalhada:** Como cozinheiro, quero visualizar os detalhes da receita de forma clara durante o preparo. | Muito Alta | Baixa |
| BB07 | **Favoritos e Coleções:** Como usuário, quero salvar receitas em pastas personalizadas (ex: "Jantar Romântico"). | Muito Alta | Média |
| BB08 | **Histórico e Avaliação:** Como usuário, quero marcar receitas como feitas e salvá-las no meu histórico com uma nota. | Média | Média |
---

## 🏃 Backlog da Sprint (Sprint 2 - Inteligência e Planejamento)
*Focada em trazer inteligência ao app: o usuário passa a planejar sua semana, gerenciar sua despensa e gerar listas de compras automaticamente.*

### Tarefas da Sprint 2
| ID | User Story | Prioridade | Dificuldade |
| :-- | :--- | :--- | :--- |
| BB14 | **Despensa Virtual:** Como usuário, quero cadastrar meus ingredientes para receber sugestões baseadas no que já possuo. | Alta | Difícil |
| BB15 | **Cardápio Semanal:** Como planejador, quero sugestões de cardápio baseadas no meu perfil e restrições alimentares. | Média | Difícil |
| BB16 | **Lista de Compras Inteligente:** Como usuário, quero gerar uma lista automática baseada no meu planejamento semanal. | Média | Média |

## 🛠️ Tecnologias Utilizadas
- **Front-end:** React Native (Expo)
- **Back-end / API:** Node.js com TypeScript
- **Bancos de Dados:** MongoDB e Supabase