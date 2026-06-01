/* ============================================================
   COMUNIDADE CATÓLICA SÃO JOSÉ — script.js
   Funcionalidades:
   1. Mapa Google Maps
   2. Cards de vídeo (hover play/pause, mudo, intersection)
   3. Contador animado dos números de impacto
   4. Copiar chave Pix
   5. Formulário de voluntário via WhatsApp
   6. Carrossel de eventos
============================================================ */

/* ─── 1. MAPA GOOGLE MAPS ─────────────────────────────── */
function initMap() {
  var localizacao = {
    lat: CONFIG.maps.lat,
    lng: CONFIG.maps.lng
  };

  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: CONFIG.maps.zoom,
    center: localizacao,
    // Estilo personalizado (opcional — mesma cor do seu site)
    styles: [
      { elementType: 'geometry',
        stylers: [{ color: '#e8edfb' }] },
      { featureType: 'road', elementType: 'geometry',
        stylers: [{ color: '#ffffff' }] },
      { featureType: 'water', elementType: 'geometry',
        stylers: [{ color: '#c9d8f5' }] },
      { featureType: 'poi',
        stylers: [{ visibility: 'off' }] }
    ]
  });
  new google.maps.Marker({
    position: localizacao,
    map: map,
    title: "Comunidade Católica São José",
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 10,
      fillColor: "#10288C",
      fillOpacity: 1,
      strokeColor: "#C9A84C",
      strokeWeight: 3
    }
  });
}


/* ─── 2. CARDS DE VÍDEO ───────────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {

  const cards = document.querySelectorAll('.historia-card');

  /* Hover play/pause */
  cards.forEach(function (card) {
    const video = card.querySelector('video');
    if (!video) return;

    card.addEventListener('mouseenter', function () {
      video.play().catch(function () {});
    });

    card.addEventListener('mouseleave', function () {
      video.pause();
    });

    card.addEventListener('touchstart', function (e) {
      if (e.target.closest('.btn-mute')) return;
      if (video.paused) {
        video.play().catch(function () {});
      } else {
        video.pause();
      }
    }, { passive: true });
  });

  /* Botão mudo/som */
  document.querySelectorAll('.btn-mute').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      const card  = btn.closest('.historia-card');
      const video = card.querySelector('video');
      if (!video) return;

      video.muted = !video.muted;
      btn.querySelector('.icon-muted').style.display = video.muted ? '' : 'none';
      btn.querySelector('.icon-sound').style.display = video.muted ? 'none' : '';

      if (!video.muted) video.play().catch(function () {});
    });
  });

  /* Intersection Observer — pausa fora da tela */
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        const video = entry.target.querySelector('video');
        if (video && !entry.isIntersecting) video.pause();
      });
    }, { threshold: 0.3 });

    cards.forEach(function (card) { obs.observe(card); });
  }


  /* ─── 3. CONTADOR ANIMADO DOS NÚMEROS ──────────────── */
  /*
     Observa a barra de números. Quando entra na tela,
     anima cada valor de 0 até o número definido em
     data-target. Roda uma vez.
  */
  const numerosEls = document.querySelectorAll('.numero-valor[data-target]');

  if ('IntersectionObserver' in window && numerosEls.length) {
    const contadorObs = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target); /* roda só uma vez */

        const el     = entry.target;
        const target = parseInt(el.getAttribute('data-target'), 10);
        const duracao = 1600;  /* ms */
        const inicio  = performance.now();

        function animar(agora) {
          const progresso = Math.min((agora - inicio) / duracao, 1);
          /* easing: ease-out */
          const eased = 1 - Math.pow(1 - progresso, 3);
          el.textContent = Math.floor(eased * target).toLocaleString('pt-BR') + '+';
          if (progresso < 1) requestAnimationFrame(animar);
        }

        requestAnimationFrame(animar);
      });
    }, { threshold: 0.5 });

    numerosEls.forEach(function (el) { contadorObs.observe(el); });
  }


  /* ─── 4. COPIAR CHAVE PIX ─────────────────────────── */
  /*
     Chamada pelo onclick do botão de copiar no HTML.
     Copia a chave e mostra feedback visual por 2 segundos.
  */
  window.copiarPix = function () {
    const chave = document.getElementById('chave-pix');
    const msg   = document.getElementById('msg-copiado');
    if (!chave) return;

    navigator.clipboard.writeText(chave.textContent.trim())
      .then(function () {
        if (msg) {
          msg.style.opacity = '1';
          setTimeout(function () { msg.style.opacity = '0'; }, 2200);
        }
      })
      .catch(function () {
        /* Fallback para navegadores que não suportam clipboard API */
        const range = document.createRange();
        range.selectNode(chave);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
        document.execCommand('copy');
        window.getSelection().removeAllRanges();
        if (msg) {
          msg.style.opacity = '1';
          setTimeout(function () { msg.style.opacity = '0'; }, 2200);
        }
      });
  };


  /* ─── 5. FORMULÁRIO VOLUNTÁRIO VIA WHATSAPP ──────── */
  /*
     Ao clicar em "Enviar via WhatsApp" no modal,
     monta uma mensagem com os dados e abre o WhatsApp.
  */
  window.enviarWhatsApp = function () {
    const nome  = document.getElementById('vol-nome')?.value.trim();
    const tel   = document.getElementById('vol-tel')?.value.trim();
    const como  = document.getElementById('vol-como')?.value;

    if (!nome || !tel || !como) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    const numeroWhatsApp = '5543996540523';

    const mensagem = encodeURIComponent(
      `Olá! Gostaria de me tornar voluntário(a) na Comunidade São José.\n\n` +
      `*Nome:* ${nome}\n` +
      `*WhatsApp:* ${tel}\n` +
      `*Como posso ajudar:* ${como}\n\n` +
      `Aguardo o contato!`
    );

    window.open(`https://wa.me/${numeroWhatsApp}?text=${mensagem}`, '_blank');
  };

}); /* fim DOMContentLoaded */

/* ============================================================
6. CARROSSEL DE EVENTOS — JavaScript puro (sem jQuery/Bootstrap)
 
   Como funciona:
   - O carrossel calcula quantos cards cabem na tela (cardsVisiveis)
   - Cada clique em Próximo/Anterior avança/recua um card
   - A fita desliza via CSS transform: translateX(...)
   - Os botões desabilitam automaticamente nos extremos
   - Os pontinhos e o contador atualizam a cada movimento
============================================================ */
 
(function () {
 
  /* ── Referências aos elementos do DOM ── */
  const wrapper   = document.getElementById('carrosselEventos');
  const fita      = document.getElementById('carrosselFita');
  const btnAntes  = document.getElementById('btnAnterior');
  const btnProx   = document.getElementById('btnProximo');
  const dotsEl    = document.getElementById('carrosselDots');
  const contador  = document.getElementById('carrosselContador');
 
  /* ── Estado ── */
  let posicaoAtual = 0;   // índice do primeiro card visível
  let cardsVisiveis = 3;  // quantos cards aparecem ao mesmo tempo
  const GAP = 20;         // deve bater com o gap do CSS em pixels
 
  /* ── Todos os cards ── */
  const cards = fita.querySelectorAll('.card-evento');
  const totalCards = cards.length;
 
  /* ────────────────────────────────────────────────
     calcularCardsVisiveis()
     Define quantos cards mostrar com base na largura
     da tela. Chamado no load e no resize.
  ──────────────────────────────────────────────── */
  function calcularCardsVisiveis() {
    const largura = window.innerWidth;
    if (largura < 600)       return 1;  // celular: 1 card
    else if (largura < 900)  return 2;  // tablet: 2 cards
    else if (largura < 1200) return 3;  // desktop médio: 3 cards
    else                     return 4;  // desktop grande: 4 cards
  }
 
  /* ────────────────────────────────────────────────
     larguraCard()
     Calcula a largura exata de um card em pixels,
     levando em conta o gap entre eles.
  ──────────────────────────────────────────────── */
  function larguraCard() {
    const larguraWrapper = wrapper.offsetWidth;
    return (larguraWrapper - GAP * (cardsVisiveis - 1)) / cardsVisiveis;
  }
 
  /* ────────────────────────────────────────────────
     maxPosicao()
     Posição máxima que o carrossel pode chegar —
     garante que o último card não ultrapasse a borda.
  ──────────────────────────────────────────────── */
  function maxPosicao() {
    return Math.max(0, totalCards - cardsVisiveis);
  }
 
  /* ────────────────────────────────────────────────
     atualizarFita()
     Move a fita para a posição atual e atualiza
     botões, pontinhos e contador.
  ──────────────────────────────────────────────── */
  function atualizarFita() {
    /* Calcula o deslocamento: cada card tem
       (larguraCard + gap) pixels de largura total */
    const deslocamento = posicaoAtual * (larguraCard() + GAP);
 
    /* Desliza a fita */
    fita.style.transform = `translateX(-${deslocamento}px)`;
 
    /* Atualiza variável CSS usada pelo card para
       calcular sua própria largura                */
    fita.style.setProperty('--cards-visiveis', cardsVisiveis);
    fita.style.setProperty('--gap', GAP + 'px');
 
    /* Desabilita botões nos extremos */
    btnAntes.disabled = posicaoAtual === 0;
    btnProx.disabled  = posicaoAtual >= maxPosicao();
 
    /* Atualiza pontinhos */
    const dots = dotsEl.querySelectorAll('.carousel-dot');
    dots.forEach(function (dot, i) {
      dot.classList.toggle('ativo', i === posicaoAtual);
    });
 
    /* Atualiza contador */
    contador.textContent = `${posicaoAtual + 1} / ${maxPosicao() + 1}`;
  }
 
  /* ────────────────────────────────────────────────
     criarPontinhos()
     Gera um pontinho por "página" possível.
  ──────────────────────────────────────────────── */
  function criarPontinhos() {
    dotsEl.innerHTML = ''; // limpa antes de recriar
 
    const totalPosicoes = maxPosicao() + 1;
 
    for (let i = 0; i < totalPosicoes; i++) {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot' + (i === 0 ? ' ativo' : '');
      dot.setAttribute('aria-label', `Ir para posição ${i + 1}`);
 
      /* Clique no pontinho vai direto para aquela posição */
      dot.addEventListener('click', function () {
        posicaoAtual = i;
        atualizarFita();
      });
 
      dotsEl.appendChild(dot);
    }
  }
 
  /* ────────────────────────────────────────────────
     inicializar()
     Configura tudo e atualiza a fita.
  ──────────────────────────────────────────────── */
  function inicializar() {
    cardsVisiveis = calcularCardsVisiveis();
 
    /* Passa a variável CSS para os cards calcularem
       a própria largura                            */
    document.documentElement.style.setProperty('--cards-visiveis', cardsVisiveis);
    document.documentElement.style.setProperty('--gap', GAP + 'px');
 
    /* Garante que posicaoAtual não passe do novo máximo
       (importante ao redimensionar a janela)       */
    posicaoAtual = Math.min(posicaoAtual, maxPosicao());
 
    criarPontinhos();
    atualizarFita();
  }
 
  /* ── Eventos dos botões ── */
  btnAntes.addEventListener('click', function () {
    if (posicaoAtual > 0) {
      posicaoAtual--;
      atualizarFita();
    }
  });
 
  btnProx.addEventListener('click', function () {
    if (posicaoAtual < maxPosicao()) {
      posicaoAtual++;
      atualizarFita();
    }
  });
 
  /* ── Suporte a teclado (acessibilidade) ── */
  document.addEventListener('keydown', function (e) {
    /* Só reage se o foco estiver dentro do carrossel */
    if (!wrapper.contains(document.activeElement) &&
        document.activeElement !== btnAntes &&
        document.activeElement !== btnProx) return;
 
    if (e.key === 'ArrowLeft'  && posicaoAtual > 0) {
      posicaoAtual--; atualizarFita();
    }
    if (e.key === 'ArrowRight' && posicaoAtual < maxPosicao()) {
      posicaoAtual++; atualizarFita();
    }
  });
 
  /* ── Swipe no celular ── */
  let touchInicioX = 0;
 
  wrapper.addEventListener('touchstart', function (e) {
    touchInicioX = e.touches[0].clientX;
  }, { passive: true });
 
  wrapper.addEventListener('touchend', function (e) {
    const diff = touchInicioX - e.changedTouches[0].clientX;
 
    /* Swipe para esquerda (diff > 50px) → avança */
    if (diff > 50 && posicaoAtual < maxPosicao()) {
      posicaoAtual++; atualizarFita();
    }
    /* Swipe para direita (diff < -50px) → recua */
    if (diff < -50 && posicaoAtual > 0) {
      posicaoAtual--; atualizarFita();
    }
  }, { passive: true });
 
  /* ── Recalcula ao redimensionar a janela ── */
  let timerResize;
  window.addEventListener('resize', function () {
    /* Debounce: espera parar de redimensionar
       antes de recalcular                    */
    clearTimeout(timerResize);
    timerResize = setTimeout(inicializar, 150);
  });
 
  /* ── Inicia ── */
  inicializar();
 
})(); /* IIFE — isola as variáveis do escopo global */