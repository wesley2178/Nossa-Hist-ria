import { Milestone, CoupleConfig } from './types';

export const INITIAL_MILESTONES: Milestone[] = [
  {
    id: '1',
    title: 'Nosso Primeiro Encontro',
    date: '2025-06-12',
    description: 'Foi o dia que tudo mudou. Eu nunca imaginei que uma simples conversa pudesse se transformar em tudo o que temos hoje. Aquele café quentinho, a chuva caindo do lado de fora e o tempo passando num piscar de olhos enquanto falávamos da vida.',
    image: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80&w=800',
    iconType: 'heart',
  },
  {
    id: '2',
    title: 'A Nossa Primeira Viagem juntos',
    date: '2025-12-20',
    description: 'Aquele fim de semana na estrada foi simplesmente inesquecível! Descobri que não importa o lugar do mundo, desde que eu esteja ali bem do seu ladinho, segurando sua mão e ouvindo suas playlists favoritas.',
    image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=800',
    iconType: 'plane',
  },
  {
    id: '3',
    title: 'A Decisão de Continuar de Mãos Dadas',
    date: '2026-02-14',
    description: 'Em um dia qualquer, nós nos olhamos e percebemos que o mundo lá fora faz muito mais sentido quando estamos juntos. Decidimos que cada amanhã seria um novo passo dado lado a lado.',
    image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=800',
    iconType: 'star',
  }
];

export const DEFAULT_CONFIG: CoupleConfig = {
  partner1: 'Amor',
  partner2: 'Você',
  startDate: '2025-06-12',
  letterTitle: 'Para o Amor da Minha Vida',
  letterContent: `Olá, meu bem! \n\nEscrevi esse espaço para te lembrar do quanto você é especial. Cada momento ao seu lado se transformou em uma lembrança inesquecível. Desde o nosso primeiro dia juntos aos planos tímidos que agora se tornam sonhos de uma vida inteira.\n\nObrigado(a) por ser meu cais, minha risada solta e meu porto seguro. Que continuemos escrevendo essa história com o mesmo carinho e amor do nosso primeiro capítulo.\n\nCom todo o amor do mundo,\nSeu par ideal.`,
  backgroundTheme: 'natural',
  bgMusicEnabled: false,
  bgMusicType: 'synth-piano',
  customMusicUrl: '',
  scrollAudioEffect: true,
  phraseSubtitle: 'Cada segundo, sorriso, viagem e desafio superados guardados para sempre, no nosso cantinho especial.',
  phraseTimerPrefix: 'Estamos Juntos Há',
  phraseTimerSuffix: 'dias',
  phraseTimelineTitle: 'Nossos Momentos',
  phraseTimelineSubtitle: 'viva cada segundo',
  phraseFooterMessage: 'Feito com amor, para guardar todos os nossos dias juntos.',
};
