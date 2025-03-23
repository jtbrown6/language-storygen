import React from 'react';
import { FaCopy } from 'react-icons/fa';

const VerbListPanel = () => {
  // List of Spanish verbs (with reflexive forms in parentheses)
  const verbs = [
    'Abrir (abrirse)',
    'Acabar (acabarse)',
    'Alegrar (alegrarse)',
    'Almorzar (almorzar)',
    'Amar (amar)',
    'Andar (andar)',
    'Aprender (aprender)',
    'Ayudar (ayudar)',
    'Bastar (bastar)',
    'Buscar (buscar)',
    'Cambiar (cambiar)',
    'Callar (callar)',
    'Casar (casarse)',
    'Cenar (cenar)',
    'Conocer (conocer)',
    'Conseguir (conseguir)',
    'Contar (contar)',
    'Correr (correr)',
    'Creer (creer)',
    'Dar (dar)',
    'Deber (deber)',
    'Decir (decir)',
    'Dejar (dejar)',
    'Desayunar (desayunar)',
    'Desear (desear)',
    'Despertar (despertarse)',
    'Disculpar (disculpar)',
    'Doler (doler)',
    'Dormir (dormirse)',
    'Empezar (empezar)',
    'Encantar (encantar)',
    'Encontrar (encontrar)',
    'Entender (entender)',
    'Entrar (entrar)',
    'Escribir (escribir)',
    'Escuchar (escuchar)',
    'Esperar (esperar)',
    'Estar (estar)',
    'Existir (existir)',
    'Extrañar (extrañar)',
    'Faltar (faltar)',
    'Funcionar (funcionar)',
    'Ganar (ganar)',
    'Gustar (gustar)',
    'Haber (haber)',
    'Hablar (hablar)',
    'Hacer (hacer)',
    'Importar (importar)',
    'Ir (irse)',
    'Jugar (jugar)',
    'Jurar (jurar)',
    'Lamentar (lamentar)',
    'Leer (leer)',
    'Llegar (llegar)',
    'Llevar (llevar)',
    'Llamar (llamar)',
    'Matar (matar)',
    'Mirar (mirar)',
    'Morir (morir)',
    'Necesitar (necesitar)',
    'Odiar (odiar)',
    'Oír (oír)',
    'Olvidar (olvidar)',
    'Pagar (pagar)',
    'Parecer (parecer)',
    'Pasar (pasar)',
    'Pedir (pedir)',
    'Pelear (pelear)',
    'Pensar (pensar)',
    'Perder (perder)',
    'Poner (ponerse)',
    'Poder (poder)',
    'Preguntar (preguntar)',
    'Preocupar (preocuparse)',
    'Probar (probar)',
    'Prometer (prometer)',
    'Quedar (quedar)',
    'Querer (querer)',
    'Recordar (recordar)',
    'Regresar (regresar)',
    'Saber (saber)',
    'Salir (salir)',
    'Salvar (salvar)',
    'Sentar (sentar)',
    'Sentir (sentir)',
    'Ser (ser)',
    'Significar (significar)',
    'Sonar (sonar)',
    'Suceder (suceder)',
    'Suponer (suponer)',
    'Temer (temer)',
    'Tener (tener)',
    'Terminar (terminar)',
    'Tocar (tocar)',
    'Tomar (tomar)',
    'Tratar (tratar)',
    'Usar (usar)',
    'Valer (valer)',
    'Vender (vender)',
    'Venir (venir)',
    'Ver (ver)',
    'Viajar (viajar)',
    'Vivir (vivir)',
    'Volver (volver)'
  ];

  // Sort verbs alphabetically
  const sortedVerbs = [...verbs].sort();

  // Copy verb to clipboard
  const copyToClipboard = (verb) => {
    // Extract just the main verb (before any parentheses)
    const mainVerb = verb.split(' ')[0];
    navigator.clipboard.writeText(mainVerb);
    
    // Show copy feedback (in a real app you might want to add a toast notification)
    alert(`Copied "${mainVerb}" to clipboard!`);
  };

  return (
    <div className="verb-list-panel">
      <h2>Spanish Verbs Reference</h2>
      <p className="verb-list-instructions">
        Click on any verb to copy it to your clipboard, then paste it into the verbs input field in the Generator tab.
      </p>
      
      <div className="verb-list-container">
        {sortedVerbs.map((verb, index) => (
          <div key={index} className="verb-item" onClick={() => copyToClipboard(verb)}>
            <span className="verb-text">{verb}</span>
            <FaCopy className="copy-icon" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default VerbListPanel;
