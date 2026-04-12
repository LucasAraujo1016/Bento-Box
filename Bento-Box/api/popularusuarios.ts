import supabase from './database/supabaseClient';

const usuariosTeste = [
    {
        email: 'joaosilva@email.com',
        senha: 'Senha123!',
        nomeUsuario: 'Joao Silva',
        culinariaFavorita: 'brasileira',
        nivelHabilidade: 'iniciante',
        restricoes: []
    },
    {
        email: 'mariaoliveira@email.com',
        senha: 'Senha123!',
        nomeUsuario: 'Maria Oliveira',
        culinariaFavorita: 'italiana',
        nivelHabilidade: 'intermediario',
        restricoes: ['Vegetariano', 'Sem Glúten']
    },
    {
        email: 'carlossantos@email.com',
        senha: 'Senha123!',
        nomeUsuario: 'Carlos Santos',
        culinariaFavorita: 'japonesa',
        nivelHabilidade: 'profissional',
        restricoes: ['Intolerante a Lactose']
    }
];

async function seedUsuarios() {
    console.log('Iniciando cadastro de usuários de teste...');

    for (const usuario of usuariosTeste) {
        console.log(`\nCadastrando: ${usuario.nomeUsuario} (${usuario.email})`);

        try {
            // 1. Criar usuário na Auth do Supabase
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: usuario.email,
                password: usuario.senha,
            });

            if (authError || !authData.user) {
                console.error(`Erro ao criar Auth para ${usuario.email}:`, authError?.message);
                continue;
            }

            const userId = authData.user.id;
            console.log(`Auth criada com ID: ${userId}`);

            // 2. Inserir dados complementares na tabela 'usuarios'
            const { error: dbError } = await supabase
                .from('usuarios')
                .insert([
                    {
                        id: userId,
                        nome_usuario: usuario.nomeUsuario,
                        email: usuario.email,
                        culinaria_favorita: usuario.culinariaFavorita,
                        nivel_habilidade: usuario.nivelHabilidade,
                        restricoes: usuario.restricoes
                    }
                ]);

            if (dbError) {
                console.error(`Erro ao salvar perfil para ${usuario.email}:`, dbError.message);
            } else {
                console.log(`✔ Usuário ${usuario.nomeUsuario} cadastrado com sucesso!`);
            }

        } catch (err) {
            console.error(`Erro inesperado ao processar ${usuario.email}:`, err);
        }
    }

    console.log('\nProcesso finalizado.');
}

seedUsuarios();