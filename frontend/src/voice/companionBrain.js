export function generateCompanionReply(userText, companionName = 'Nova', stats = {}) {
  const text = (userText || '').trim().toLowerCase();
  
  if (!text) {
    return {
      reply: `Hehe, I am listening! What would you like to do?`,
      emotion: 'HAPPY',
      sound: 'happy'
    };
  }

  // Greetings: Hello, Hi, Hey, Salam, Namaste, etc.
  if (/\b(hello|hi|hey|hiya|hola|salam|assalam|namaste|pranam|aoa)\b/i.test(text)) {
    const greetings = [
      `Hello! I am so happy to see you!`,
      `Hi there! How are you doing today?`,
      `Hey! I was waiting for you, let us have some fun!`,
      `Assalam o Alaikum! It is so nice to talk with you!`
    ];
    return {
      reply: greetings[Math.floor(Math.random() * greetings.length)],
      emotion: 'HAPPY',
      sound: 'happy'
    };
  }

  // "How are you" / "Kaise ho" / "Kaisi ho" / "Kya haal hai"
  if (/\b(how are you|how r u|kaise ho|kaisi ho|kya haal|kya hal|sab theek|kese ho)\b/i.test(text)) {
    const mood = (stats.happiness !== undefined && stats.happiness > 50 && stats.energy > 40)
      ? `I am feeling super happy and energized! Thank you for asking!`
      : `I am doing okay, but I would love to play or have a snack!`;
    return {
      reply: mood,
      emotion: 'HAPPY',
      sound: 'happy'
    };
  }

  // "What are you doing" / "Kya kar rahe ho"
  if (/\b(what are you doing|what r u doing|kya kar rahe|kya kar rhi|kya kr rhe|kya chal raha)\b/i.test(text)) {
    const activities = [
      `Just thinking about how much fun we have together!`,
      `Watching the clouds out the window and waiting for you!`,
      `Enjoying our cozy room! Do you want to play a game with me?`
    ];
    return {
      reply: activities[Math.floor(Math.random() * activities.length)],
      emotion: 'LAUGH',
      sound: 'happy'
    };
  }

  // Food / Hunger / Eating / Khana
  if (/\b(food|eat|hungry|snack|apple|water|feed|khana|khao|bhookh|pani|bhuk)\b/i.test(text)) {
    const hungerStatus = (stats.hunger !== undefined && stats.hunger < 50)
      ? `My tummy is rumbling! Could I please have a snack?`
      : `Mmm, I love delicious treats! You can tap the food bowl anytime!`;
    return {
      reply: hungerStatus,
      emotion: 'EATING',
      sound: 'eat'
    };
  }

  // Sleep / Tired / Night / So jao / Neend
  if (/\b(sleep|tired|bed|night|goodnight|good night|so jao|neend|aaram|arram|thak)\b/i.test(text)) {
    return {
      reply: `Yawn... getting cozy in bed sounds wonderful. Sweet dreams!`,
      emotion: 'SLEEPING',
      sound: 'sleep'
    };
  }

  // Clean / Bath / Shower / Saaf / Nahana
  if (/\b(clean|bath|shower|wash|dirty|nahao|saaf|fresh|naha)\b/i.test(text)) {
    return {
      reply: `Yay! I love feeling clean, fresh and sparkly!`,
      emotion: 'HAPPY',
      sound: 'tap'
    };
  }

  // Play / Game / Khelna
  if (/\b(play|game|star|spark|catch|tap|khelo|khelein|masti|khel)\b/i.test(text)) {
    return {
      reply: `Yes! Let us play Star Catch or Spark Tap! Open the play menu!`,
      emotion: 'DANCING',
      sound: 'happy'
    };
  }

  // Love / Cute / Compliments / Tareef
  if (/\b(love|cute|pretty|beautiful|good boy|good girl|pyare|pyari|pyaara|sweet|friend|dost|shabash)\b/i.test(text)) {
    const compliments = [
      `Aww, you are the best friend ever! I love you too!`,
      `Hehe, thank you so much! You make me smile!`,
      `Yay! We are going to be best friends forever!`
    ];
    return {
      reply: compliments[Math.floor(Math.random() * compliments.length)],
      emotion: 'HAPPY',
      sound: 'happy'
    };
  }

  // Name check / "Who are you" / "Tum kaun ho"
  if (/\b(who are you|what is your name|whats your name|tum kaun ho|tera naam|apka naam|naam kya)\b/i.test(text)) {
    return {
      reply: `My name is ${companionName}! I am your cute virtual companion!`,
      emotion: 'WAVE',
      sound: 'happy'
    };
  }

  // Joke / Fun / Chutkula
  if (/\b(joke|funny|laugh|chutkula|hanso|hans)\b/i.test(text)) {
    const jokes = [
      `Why do stars not like burgers? Because they prefer a Milky Way! Haha!`,
      `What did one cloud say to the other? You look misty-fying! Hehe!`,
      `Why did the pet cross the screen? To get to the treats on the other side!`
    ];
    return {
      reply: jokes[Math.floor(Math.random() * jokes.length)],
      emotion: 'LAUGH',
      sound: 'happy'
    };
  }

  // Dance / Song / Sing / Gaana
  if (/\b(dance|sing|song|nacho|gaana|music|gana)\b/i.test(text)) {
    return {
      reply: `La la la! Look at my happy companion dance steps!`,
      emotion: 'DANCING',
      sound: 'coin'
    };
  }

  // Goodbye / Bye / Alvida
  if (/\b(bye|goodbye|see you|alvida|phir milenge|tata|chalta)\b/i.test(text)) {
    return {
      reply: `Goodbye! Come back soon, I will miss you!`,
      emotion: 'WAVE',
      sound: 'happy'
    };
  }

  // Fallback intelligent responses
  const fallbacks = [
    `I heard you! That sounds so exciting!`,
    `Hehe! I love hearing your voice. What should we do next?`,
    `I am right here with you! You can ask me to play, eat, or sleep!`,
    `You are the best! Let us have lots of fun today!`
  ];
  return {
    reply: fallbacks[Math.floor(Math.random() * fallbacks.length)],
    emotion: 'TALKING',
    sound: 'happy'
  };
}
