
const SUPABASE_URL = 'https://ljmaflnjeglmyxmmblfp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqbWFmbG5qZWdsbXl4bW1ibGZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0NjkzODIsImV4cCI6MjA2NDA0NTM4Mn0.z2aPVzSMVrFRjaTdGQygnLrRQq-OsLcecNurDM0Ody8';

// Inicializar cliente Supabase
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Elementos DOM
const rankingTable = document.getElementById('ranking-alunos');
const rankingTableBody = rankingTable.querySelector('tbody');
const loadingMessage = document.getElementById('loading-message');
const errorMessage = document.getElementById('error-message');

// Dados de exemplo para demonstração
const exemploAlunos = [
  { nome: 'Ana Silva', turma: '2º 1', pontos: 250 },
  { nome: 'João Santos', turma: '2º 2', pontos: 135 },
  { nome: 'Maria Oliveira', turma: '2º 3', pontos: 228 },
  { nome: 'Pedro Gabriel', turma: '2º 4', pontos: 1150 },
  { nome: 'Sofia Ferreira', turma: '2º 5', pontos: 410 },
  { nome: 'Lucas Mendes', turma: '2º 6', pontos: 105 },
  { nome: 'Isabella Lima', turma: '2º 7', pontos: 198 },
  { nome: 'Gabriel Rocha', turma: '2º 8', pontos:392 },
];

// Função para mostrar loading
function mostrarLoading() {
  loadingMessage.style.display = 'block';
  errorMessage.style.display = 'none';
  rankingTableBody.innerHTML = '';
}

// Função para esconder loading
function esconderLoading() {
  loadingMessage.style.display = 'none';
}

// Função para mostrar erro
function mostrarErro(mensagem) {
  errorMessage.textContent = mensagem;
  errorMessage.style.display = 'block';
  esconderLoading();
}

// Função para renderizar ranking
function renderizarRanking(alunos) {
  esconderLoading();
  rankingTableBody.innerHTML = '';

  if (!alunos || alunos.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = '<td colspan="4" style="text-align: center; font-style: italic;">Nenhum aluno encontrado</td>';
    rankingTableBody.appendChild(tr);
    return;
  }

  // Ordenar por pontos (decrescente)
  const alunosOrdenados = [...alunos].sort((a, b) => b.pontos - a.pontos);

  alunosOrdenados.forEach((aluno, index) => {
    const tr = document.createElement('tr');
    
    // Adicionar classe especial para os top 3
    if (index < 3) {
      tr.classList.add(`top-${index + 1}`);
    }

    tr.innerHTML = `
      <td style="font-weight: bold; color: ${getPosicaoCor(index + 1)};">
        ${getPosicaoTexto(index + 1)}
      </td>
      <td style="font-weight: 600;">${aluno.nome || aluno.name}</td>
      <td>${aluno.turma || aluno.school_name || 'N/A'}</td>
      <td style="font-weight: bold; color: #4CAF50;">${aluno.pontos || aluno.total_points}</td>
    `;

    rankingTableBody.appendChild(tr);
  });
}

// Função para obter cor da posição
function getPosicaoCor(posicao) {
  switch(posicao) {
    case 1: return '#FFD700'; // Ouro
    case 2: return '#C0C0C0'; // Prata
    case 3: return '#CD7F32'; // Bronze
    default: return '#4CAF50';
  }
}

// Função para obter texto da posição com emoji
function getPosicaoTexto(posicao) {
  switch(posicao) {
    case 1: return '🥇 1º';
    case 2: return '🥈 2º';
    case 3: return '🥉 3º';
    default: return `${posicao}º`;
  }
}

// Função para carregar ranking do Supabase
async function carregarRankingSupabase() {
  try {
    const { data: alunos, error } = await supabaseClient
      .rpc('get_user_ranking');

    if (error) {
      console.error('Erro Supabase:', error);
      // Fallback para dados de exemplo
      renderizarRanking(exemploAlunos);
      return;
    }

    if (alunos && alunos.length > 0) {
      renderizarRanking(alunos);
    } else {
      // Se não há dados no Supabase, usar exemplo
      renderizarRanking(exemploAlunos);
    }
  } catch (err) {
    console.error('Erro ao conectar com Supabase:', err);
    // Fallback para dados de exemplo
    renderizarRanking(exemploAlunos);
  }
}

// Função para simular atualização em tempo real
function simularAtualizacao() {
  setInterval(() => {
    // Simular pequenas mudanças nos pontos
    exemploAlunos.forEach(aluno => {
      if (Math.random() > 0.9) { // 10% chance de ganhar pontos
        aluno.pontos += Math.floor(Math.random() * 5) + 1;
      }
    });
    
    renderizarRanking(exemploAlunos);
  }, 30000); // Atualizar a cada 30 segundos
}

// Função para filtrar ranking
function criarFiltros() {
  const filtroContainer = document.createElement('div');
  filtroContainer.style.cssText = `
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(240,248,240,0.9) 100%);
    border-radius: 15px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    align-items: center;
  `;

  filtroContainer.innerHTML = `
    <label style="font-weight: 600; color: #2c3e50;">Filtrar por turma:</label>
    <select id="filtro-turma" style="
      padding: 0.5rem 1rem;
      border: 2px solid #4CAF50;
      border-radius: 25px;
      background: white;
      color: #2c3e50;
      font-weight: 500;
      cursor: pointer;
    ">
      <option value="">Todas as turmas</option>
      <option value="7º A">7º A</option>
      <option value="7º B">7º B</option>
      <option value="7º C">7º C</option>
      <option value="8º A">8º A</option>
      <option value="8º B">8º B</option>
      <option value="8º C">8º C</option>
      <option value="9º A">9º A</option>
      <option value="9º B">9º B</option>
      <option value="9º C">9º C</option>
    </select>
    <button id="btn-atualizar" style="
      padding: 0.5rem 1.5rem;
      background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
      color: white;
      border: none;
      border-radius: 25px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    ">🔄 Atualizar</button>
  `;

  const rankingContainer = document.querySelector('.ranking-container');
  rankingContainer.insertBefore(filtroContainer, rankingContainer.firstChild);

  // Event listeners
  document.getElementById('filtro-turma').addEventListener('change', (e) => {
    const turmaFiltro = e.target.value;
    let alunosFiltrados = exemploAlunos;
    
    if (turmaFiltro) {
      alunosFiltrados = exemploAlunos.filter(aluno => aluno.turma === turmaFiltro);
    }
    
    renderizarRanking(alunosFiltrados);
  });

  document.getElementById('btn-atualizar').addEventListener('click', () => {
    mostrarLoading();
    setTimeout(() => {
      carregarRankingSupabase();
    }, 1000);
  });
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  console.log('Carregando ranking de alunos...');
  
  mostrarLoading();
  criarFiltros();
  
  // Tentar carregar do Supabase primeiro
  carregarRankingSupabase();
  
  // Iniciar simulação de atualizações
  simularAtualizacao();
});

// Adicionar estilos CSS específicos para o ranking
const estilosCustom = document.createElement('style');
estilosCustom.textContent = `
  .ranking-container .top-1 {
    background: linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%);
    border-left: 4px solid #FFD700;
  }
  
  .ranking-container .top-2 {
    background: linear-gradient(135deg, rgba(192, 192, 192, 0.1) 0%, rgba(192, 192, 192, 0.05) 100%);
    border-left: 4px solid #C0C0C0;
  }
  
  .ranking-container .top-3 {
    background: linear-gradient(135deg, rgba(205, 127, 50, 0.1) 0%, rgba(205, 127, 50, 0.05) 100%);
    border-left: 4px solid #CD7F32;
  }
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
  
  .ranking-container .top-1:hover {
    animation: pulse 1s infinite;
  }
`;
document.head.appendChild(estilosCustom);
