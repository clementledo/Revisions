import type { Card } from '@/lib/types';

// Cartes mémoire MTI881, tirées des récaps de la page de révision (elle-même basée sur les slides).
// ch = id du chapitre dans la page.
const raw: [string, string, string][] = [
  // ---------------- Cours 1
  ['c1', "Qu'est-ce que l'apprentissage par renforcement ?", "Apprendre un comportement par interaction : l'agent agit, l'environnement renvoie une observation et une récompense scalaire. On maximise la récompense cumulée."],
  ['c1', 'Différence entre RL et apprentissage supervisé ?', "En RL il n'y a pas d'étiquette correcte, seulement une récompense, et les actions de l'agent changent les données qu'il verra ensuite."],
  ['c1', 'Les trois grandes difficultés du RL ?', "1) Données non IID. 2) Dilemme exploration / exploitation. 3) Récompense différée (problème d'attribution du crédit)."],
  ['c1', "Où passe la frontière agent / environnement pour un robot ?", "L'agent est seulement le décideur (le contrôleur logiciel). Le corps du robot, ses moteurs et capteurs font partie de l'environnement."],
  ['c1', 'Observation ou état : quelle différence ?', "L'état est la situation réelle de l'environnement. L'observation est ce que l'agent en perçoit : elle peut être partielle, bruitée ou différée."],
  ['c1', 'Que définit la récompense ?', "Le succès, pas le comportement. Une récompense mal conçue fait optimiser autre chose que l'objectif réel."],
  ['c1', 'Propriété de Markov ?', "P(Sₜ₊₁ | Sₜ, …, S₀) = P(Sₜ₊₁ | Sₜ) : l'état présent suffit pour prédire le suivant. Elle dépend de la représentation (on peut enrichir l'état : météo + saison)."],
  ['c1', 'MP, MRP, MDP, RL : que contient chacun ?', 'MP : états + transitions. MRP : + récompenses + γ. MDP : + actions. RL : trouver par l’expérience la politique au rendement espéré maximal.'],
  ['c1', 'Formule du rendement actualisé Gₜ ?', 'Gₜ = Rₜ₊₁ + γRₜ₊₂ + γ²Rₜ₊₃ + … = Σₖ γᵏ Rₜ₊ₖ₊₁'],
  ['c1', 'Pourquoi γ < 1 dans un processus sans fin ?', 'Avec γ = 1 et +1 à chaque pas, le rendement est infini. Avec γ < 1 la série est finie : Σ γᵏ = 1/(1 − γ) (γ = 0.9 donne 10).'],
  ['c1', 'Définition de la valeur V(s) ?', 'V(s) = 𝔼[Gₜ | Sₜ = s] : le rendement espéré quand on part de s.'],
  ['c1', 'Probabilité de transition à deux pas de i vers j ?', 'Σₖ Pᵢₖ · Pₖⱼ : on somme sur tous les états intermédiaires possibles.'],
  ['c1', "Qu'est-ce qu'une politique π ?", "π(a | s) = P(Aₜ = a | Sₜ = s) : une distribution d'actions pour chaque état. Déterministe si toute la probabilité est sur une action."],
  ['c1', 'MRP induit par une politique : formules ?', "P^π(s′|s) = Σₐ π(a|s) P(s′|s,a)   et   R^π(s,s′) = Σₐ π(a|s) R(s,a,s′)"],
  ['c1', "Dans un MDP, que détermine le choix d'une action ?", "Seulement la distribution des états suivants, pas l'état suivant lui-même."],
  ['c1', 'La « Bitter Lesson » de Sutton ?', 'Les méthodes générales fondées sur la recherche et l’apprentissage, qui profitent de plus de calcul, battent à long terme les connaissances humaines codées à la main.'],

  // ---------------- Cours 2a
  ['c2a', 'Les quatre éléments de base d’un environnement Gymnasium ?', 'action_space, observation_space, reset() et step(action).'],
  ['c2a', 'Que renvoient reset() et step() ?', 'reset() → obs, info (2 valeurs). step(a) → obs, reward, terminated, truncated, info (5 valeurs).'],
  ['c2a', 'terminated ou truncated ?', 'terminated : fin naturelle de la tâche (poteau tombé, but atteint). truncated : arrêt externe, comme une limite de temps. Les deux demandent un reset().'],
  ['c2a', 'Les trois espaces principaux ?', 'Discrete(n) : un choix parmi n. Box : tenseur numérique borné (continu ou image). Tuple : combinaison d’espaces.'],
  ['c2a', 'Méthodes communes d’un Space ?', 'sample() (tirer au hasard), contains(x) (vérifier), shape et seed().'],
  ['c2a', 'CartPole en chiffres ?', '2 actions, 4 observations continues, +1 par pas, au plus 500 pas. Une politique aléatoire tient environ 12 à 15 pas.'],
  ['c2a', 'À quoi sert un wrapper ?', 'Modifier observations, récompenses ou actions sans toucher à l’environnement. Les wrappers s’imbriquent.'],
  ['c2a', 'Que fait RandomActionWrapper ?', 'Il remplace l’action par une action aléatoire avec probabilité ε : c’est de l’exploration ε.'],
  ['c2a', 'Comment obtenir une vidéo ou une fenêtre de rendu ?', 'render_mode="rgb_array", puis HumanRendering (fenêtre) ou RecordVideo (fichiers).'],
  ['c2a', 'Convention de nom des environnements ?', 'NomEnvironnement-vN (N = version), créé par gym.make(nom). Variantes Atari : Deterministic, NoFrameskip, -ram.'],
  ['c2a', 'Pourquoi passer un seed à reset() ?', 'Sans seed, les expériences ne sont pas reproductibles.'],

  // ---------------- Cours 2b
  ['c2b', 'Type par défaut des tenseurs en apprentissage profond ?', 'float32.'],
  ['c2b', 'Que signifie le suffixe _ sur une méthode de tenseur ?', 'Opération sur place (le tenseur est modifié directement).'],
  ['c2b', 'Règle des devices ?', 'Le modèle et les données doivent être sur le même appareil (.to(device)). Revenir sur CPU avant de convertir en NumPy.'],
  ['c2b', 'Comment fonctionne autograd ?', 'requires_grad=True, graphe construit dynamiquement, backward() applique la règle de la chaîne, les gradients s’accumulent dans .grad.'],
  ['c2b', 'Structure d’un nn.Module ?', 'Les couches dans __init__, le calcul dans forward(). nn.Sequential pour enchaîner, state_dict() pour sauvegarder.'],
  ['c2b', 'Quelle perte pour quel problème ?', 'MSE : régression. CrossEntropy : classification (logits bruts). BCE : binaire.'],
  ['c2b', 'Les trois lignes d’un pas d’entraînement ?', 'optimizer.zero_grad(); loss.backward(); optimizer.step()'],
  ['c2b', 'Que se passe-t-il si on oublie zero_grad() ?', 'Les gradients s’additionnent d’un lot à l’autre.'],
  ['c2b', 'Faut-il un softmax avant CrossEntropyLoss ?', 'Non : CrossEntropyLoss prend les logits bruts.'],
  ['c2b', 'Comment évaluer un modèle proprement ?', 'model.eval() + torch.no_grad(). eval() seul ne coupe pas autograd.'],
  ['c2b', 'Classe prédite à partir des scores ?', 'scores.argmax(dim=1).'],
  ['c2b', 'Nombre de lots pour N exemples ?', '⌈N / taille du lot⌉.'],

  // ---------------- Cours 3
  ['c3', 'Les trois axes de la taxonomie du RL ?', 'Model-free / model-based · value-based / policy-based · on-policy / off-policy.'],
  ['c3', 'Qu’est-ce qu’une méthode acteur–critique ?', 'Une méthode qui combine une politique (acteur) et une fonction de valeur (critique).'],
  ['c3', 'Classement de la CEM sur les trois axes ?', 'Model-free, policy-based, on-policy. Simple et robuste, mais peu efficace en données.'],
  ['c3', 'Principe de la CEM ?', 'Jouer N épisodes, garder les élites (retour ≥ centile), entraîner le réseau à reproduire leurs paires (observation, action) avec l’entropie croisée.'],
  ['c3', 'Pourquoi échantillonner l’action plutôt que prendre l’argmax en CEM ?', 'Pour explorer : on tire l’action selon les probabilités du réseau (softmax des logits).'],
  ['c3', 'Comment calculer le seuil des élites ?', 'np.percentile(rewards, 70) : le centile ρ des retours du lot.'],
  ['c3', 'Hyperparamètres de la CEM sur CartPole ?', '128 neurones cachés, 16 épisodes par lot, centile 70, Adam lr 0.01. Moyenne 475 en environ 50 itérations.'],
  ['c3', 'Pourquoi la CEM échoue sur FrozenLake ?', 'Récompense éparse et binaire : le seuil tombe à 0 et on ne distingue plus les bons épisodes.'],
  ['c3', 'Les 5 correctifs pour FrozenLake ?', 'Plus gros lots · score actualisé r·γᵀ · garder les élites d’un lot à l’autre · taux d’apprentissage ÷ 10 · entraîner plus longtemps. Environ 55 % de succès.'],
  ['c3', 'Pourquoi un > strict avec un seuil de 0 ?', 'Avec ≥ on garderait aussi les épisodes ratés (retour 0).'],
  ['c3', 'Effet d’un centile élevé ?', 'Moins de données gardées, mais de meilleure qualité. Un centile bas fait l’inverse.'],
  ['c3', 'Divergence KL ?', 'D_KL(p‖q) = 𝔼ₚ[log p] − 𝔼ₚ[log q]. La minimiser vers la distribution des élites revient à minimiser l’entropie croisée.'],
  ['c3', 'Échantillonnage d’importance ?', '𝔼ₚ[H] = 𝔼_q[(p/q)·H].'],

  // ---------------- Cours 4
  ['c4', 'Définitions de V^π(s) et Q^π(s,a) ?', 'V^π(s) : rendement espéré en suivant π depuis s. Q^π(s,a) : rendement espéré en faisant a puis en suivant π.'],
  ['c4', 'Pourquoi ne pas agir de façon gourmande sur la récompense immédiate ?', 'Un +2 immédiat peut mener à un −20 ensuite. Il faut comparer r + γV(s′).'],
  ['c4', 'Équation de Bellman (politique fixée) ?', 'V^π(s) = Σₐ π(a|s) Σₛ′ p(s′|s,a) [r + γV^π(s′)]'],
  ['c4', 'Équation d’optimalité de Bellman pour V* ?', 'V*(s) = maxₐ Σₛ′ p(s′|s,a) [r + γV*(s′)]'],
  ['c4', 'Équation d’optimalité pour Q* ?', 'Q*(s,a) = Σₛ′ p(s′|s,a) [r + γ maxₐ′ Q*(s′,a′)]'],
  ['c4', 'Linéaire ou non : le système de Bellman ?', 'Linéaire quand la politique est fixée ; non linéaire avec le max (optimalité). Une équation par état.'],
  ['c4', 'Avantage de connaître Q* ?', 'La politique optimale est un simple argmax sur les actions, sans modèle.'],
  ['c4', 'Principe de l’itération de valeurs ?', 'Partir de V = 0 et appliquer Bellman en boucle. Converge vers V* si γ < 1.'],
  ['c4', 'Comment estimer le modèle sur FrozenLake ?', 'Par comptage : p̂(s′|s,a) = N(s,a,s′) / Σₓ N(s,a,x).'],
  ['c4', 'Boucle d’entraînement de l’itération de valeurs sur FrozenLake ?', '100 pas aléatoires, puis mise à jour des valeurs, puis 20 épisodes de test sur un test_env séparé.'],
  ['c4', 'Q-itération vs itération de valeurs ?', 'On stocke Q(s,a) au lieu de V(s) (4× plus d’entrées sur FrozenLake) et la sélection d’action est directe.'],
  ['c4', 'Limites des méthodes tabulaires du cours 4 ?', 'États discrets et peu nombreux, modèle estimé nécessaire, et toujours sensibles aux récompenses éparses.'],
  ['c4', 'Théorème d’amélioration de politique ?', 'Si chaque choix de π′ est au moins aussi bon en une étape, π′ est au moins aussi bonne partout.'],
  ['c4', 'Valeur du cycle s₁ ⇄ s₂ avec γ = 0.9 ?', 'V(s₁) = (1 + 2γ)/(1 − γ²) ≈ 14.74.'],

  // ---------------- Cours 5
  ['c5', 'Mise à jour du Q-learning tabulaire ?', 'Q ← Q + α(y − Q) avec y = r + γ maxₐ′ Q(s′,a′), et y = r si l’état est terminal.'],
  ['c5', 'Que représente α en Q-learning ?', 'Un taux d’apprentissage : la mise à jour est une descente de gradient sur ½(y − Q)², mais la cible bouge avec les estimations.'],
  ['c5', 'SARSA vs Q-learning ?', 'SARSA (on-policy) utilise Q(sₜ₊₁, aₜ₊₁), l’action réellement jouée. Q-learning (off-policy) utilise le max.'],
  ['c5', 'Pourquoi remplacer la table Q par un réseau ?', 'Trop d’états (Pong en a un nombre astronomique) et aucune généralisation. Le réseau Q_θ(s) sort une valeur par action.'],
  ['c5', 'Les 4 défis du DQN et leurs solutions ?', 'Exploration → ε-greedy décroissant. Corrélation → tampon de rejeu. Cibles mobiles → réseau cible. Observabilité partielle → 4 images empilées.'],
  ['c5', 'Perte du DQN ?', 'L = (Q_θ(s,a) − [r + γ maxₐ′ Q̂_θ̄(s′,a′)])²'],
  ['c5', 'Calendrier de ε ?', 'εₜ = max(ε_final, ε_start − t/β). Dans le cours : 1 → 0.01 sur 150 000 frames.'],
  ['c5', 'Architecture DQN Atari ?', '3 convolutions (32-64-64), flatten 3136, couche de 512, |A| sorties linéaires.'],
  ['c5', 'Taille de sortie d’une convolution ?', '⌊(n − k)/s⌋ + 1. Sur Atari : 84 → 20 → 9 → 7, et 64·7·7 = 3136.'],
  ['c5', 'Hyperparamètres DQN Pong ?', 'γ 0.99, lot 32, tampon 10 000, lr 1e-4, synchro du réseau cible toutes les 1000 itérations.'],
  ['c5', 'Rôle de gather dans calc_loss ?', 'net(s).gather(1, a.unsqueeze(-1)).squeeze(-1) prend la valeur Q de l’action réellement jouée pour chaque exemple.'],
  ['c5', 'Pièges du DQN ?', 'Oublier next_values[dones] = 0, laisser passer le gradient dans le réseau cible (utiliser no_grad), entraîner avant que le tampon soit rempli.'],

  // ---------------- Cours 6
  ['c6', 'Idée du DQN à N pas ?', 'Sommer n vraies récompenses avant de bootstrapper : propagation plus rapide. n = 2–3 aide, un grand n ajoute trop de variance.'],
  ['c6', 'Cible à N pas ?', 'yₜ = Σₖ₌₀ⁿ⁻¹ γᵏ rₜ₊ₖ + γⁿ maxₐ′ Q̂(sₜ₊ₙ, a′)'],
  ['c6', 'Problème réglé par le Double DQN ?', 'La surestimation causée par le max sur des valeurs bruitées.'],
  ['c6', 'Cible du Double DQN ?', 'y = r + γ Q̂(s′, argmaxₐ Q(s′,a)) : Q choisit l’action, Q̂ l’évalue. Change la cible, pas l’architecture.'],
  ['c6', 'Réseaux bruités : principe ?', 'Poids w = μ + σε, avec μ et σ appris (ε ne l’est pas). Exploration dépendante de l’état, plus besoin de calendrier ε.'],
  ['c6', 'Rejeu prioritaire : formules ?', 'P(i) = pᵢ^α / Σₖ pₖ^α avec pᵢ = |δᵢ| + ε ; poids d’importance wᵢ = (N·P(i))^−β, β → 1.'],
  ['c6', 'Que donne α = 0 dans le rejeu prioritaire ?', 'Un tirage uniforme (rien à voir avec le α du Q-learning).'],
  ['c6', 'Dueling DQN : décomposition ?', 'Q = V + A − moyenne de A. Deux têtes sur un tronc CNN commun ; centrer A rend V et A identifiables.'],
  ['c6', 'DQN catégorique (C51) ?', 'Prédire une distribution sur 51 atomes dans [−10, 10], projeter r + γz sur les atomes voisins, perte = entropie croisée.'],
  ['c6', 'Projection C51 : étapes ?', 'Δz = (Vmax − Vmin)/(N − 1), ẑ = clip(r + γzⱼ), b = (ẑ − Vmin)/Δz, l = ⌊b⌋, u = ⌈b⌉ ; (u − b) de la masse va à l, (b − l) va à u.'],
  ['c6', 'Qu’est-ce que Rainbow ?', 'La combinaison des six extensions : N pas, Double, Noisy, PER, Dueling, C51.'],
]

// Identifiant stable tiré du texte de la question (garde la progression si l'ordre change).
const hash = (s: string) => {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
};

export const cards: Card[] = raw.map(([ch, q, a]) => ({ id: `mti881-${hash(q)}`, ch, q, a }));
