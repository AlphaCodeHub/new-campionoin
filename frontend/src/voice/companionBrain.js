export function generateCompanionReply(userText, companionName = 'Nova', stats = {}) {
  const text = (userText || '').trim().toLowerCase();
  const nameLower = (companionName || 'nova').toLowerCase();

  if (!text) {
    return {
      reply: `Hehe, I am listening! What would you like to do?`,
      emotion: 'HAPPY',
      sound: 'happy',
      actionTrigger: 'tap'
    };
  }

  // Voice Commands: Sleep / So jao / Bed
  if (/\b(sleep|tired|bed|goodnight|good night|so jao|neend|aaram|arram|thak|rest|go to bed)\b/i.test(text)) {
    return {
      reply: `Yawn... getting cozy in bed. Sweet dreams, friend!`,
      emotion: 'SLEEPING',
      sound: 'sleep',
      actionTrigger: 'sleep'
    };
  }

  // Voice Commands: Food / Khana / Eat / Apple / Hungry
  if (/\b(food|eat|hungry|snack|apple|water|feed|khana|khao|bhookh|pani|bhuk|treat|breakfast|lunch|dinner)\b/i.test(text)) {
    const isHungry = stats.hunger !== undefined && stats.hunger < 50;
    return {
      reply: isHungry 
        ? `Yummy! My tummy was rumbling. That was delicious!`
        : `Mmm, yummy treat! I love eating snacks with you!`,
      emotion: 'EATING',
      sound: 'eat',
      actionTrigger: 'feed',
      foodItem: { name: 'Apple', cost: 0, hunger: 12, happiness: 3 }
    };
  }

  // Voice Commands: Clean / Bath / Wash / Saaf / Nahao
  if (/\b(clean|bath|shower|wash|dirty|nahao|saaf|fresh|naha|mirror|sponge)\b/i.test(text)) {
    return {
      reply: `Sparkle sparkle! I feel all fresh, clean and sparkly now!`,
      emotion: 'HAPPY',
      sound: 'tap',
      actionTrigger: 'clean'
    };
  }

  // Voice Commands: Play / Game / Khelna / Star / Spark
  if (/\b(play|game|star|spark|catch|khelo|khelein|masti|khel|minigame|play game)\b/i.test(text)) {
    return {
      reply: `Yay! Let us play a game together! Pick Star Catch or Spark Tap!`,
      emotion: 'DANCING',
      sound: 'happy',
      actionTrigger: 'play'
    };
  }

  // Name recognition (e.g. "hello nova", "hey nova", "nova")
  if (text.includes(nameLower)) {
    if (/\b(hello|hi|hey|hiya|hola|salam|assalam|namaste)\b/i.test(text)) {
      return {
        reply: `Hello there! Yes, I am ${companionName}! It is so wonderful to talk with you!`,
        emotion: 'WAVE',
        sound: 'happy',
        actionTrigger: 'tap'
      };
    }
    if (/\b(how are you|kaise ho|kaisi ho|kya haal)\b/i.test(text)) {
      return {
        reply: `I am feeling wonderful, thank you! How are you doing today?`,
        emotion: 'HAPPY',
        sound: 'happy',
        actionTrigger: 'tap'
      };
    }
    if (text === nameLower || text === `hey ${nameLower}` || text === `hello ${nameLower}`) {
      return {
        reply: `Yes! I am right here listening. What would you like to do?`,
        emotion: 'HAPPY',
        sound: 'happy',
        actionTrigger: 'tap'
      };
    }
  }

  // Greetings: Hello, Hi, Hey, Salam, Namaste
  if (/\b(hello|hi|hey|hiya|hola|salam|assalam|namaste|pranam|aoa|kese ho|kaise)\b/i.test(text)) {
    const greetings = [
      `Hello! I am so happy to hear your voice!`,
      `Hi there! How is your day going?`,
      `Hey! I was waiting for you, let us have lots of fun!`,
      `Assalam o Alaikum! It is always nice to talk with you!`
    ];
    return {
      reply: greetings[Math.floor(Math.random() * greetings.length)],
      emotion: 'HAPPY',
      sound: 'happy',
      actionTrigger: 'tap'
    };
  }

  // "How are you" / "Kaise ho"
  if (/\b(how are you|how r u|kaise ho|kaisi ho|kya haal|kya hal|sab theek|kese ho|how do you do)\b/i.test(text)) {
    const mood = (stats.happiness !== undefined && stats.happiness > 50 && stats.energy > 40)
      ? `I am feeling full of energy and super happy!`
      : `I am doing great! Being with you always cheers me up!`;
    return {
      reply: mood,
      emotion: 'HAPPY',
      sound: 'happy',
      actionTrigger: 'tap'
    };
  }

  // "What are you doing" / "Kya kar rahe ho"
  if (/\b(what are you doing|what r u doing|kya kar rahe|kya kar rhi|kya kr rhe|kya chal raha|what is up|whats up)\b/i.test(text)) {
    const activities = [
      `Just relaxing in our room and enjoying talking with you!`,
      `Watching the clouds drift outside the window!`,
      `Practicing my companion dance moves!`
    ];
    return {
      reply: activities[Math.floor(Math.random() * activities.length)],
      emotion: 'LAUGH',
      sound: 'happy',
      actionTrigger: 'tap'
    };
  }

  // Dance / Song / Music / Gaana
  if (/\b(dance|sing|song|nacho|gaana|music|gana|disco)\b/i.test(text)) {
    return {
      reply: `La la la! Dancing is my favorite! Look at me go!`,
      emotion: 'DANCING',
      sound: 'coin',
      actionTrigger: 'tap'
    };
  }

  // Jokes / Chutkula / Funny
  if (/\b(joke|funny|laugh|chutkula|hanso|hans|tell me a joke)\b/i.test(text)) {
    const jokes = [
      `Why do stars never get tired? Because they shine all night! Haha!`,
      `What did one cloud say to another? You look misty-fying! Hehe!`,
      `Why did the companion cross the screen? To get to the treats on the other side!`
    ];
    return {
      reply: jokes[Math.floor(Math.random() * jokes.length)],
      emotion: 'LAUGH',
      sound: 'happy',
      actionTrigger: 'tap'
    };
  }

  // Love / Compliments / Tareef
  if (/\b(love|cute|pretty|beautiful|good boy|good girl|pyare|pyari|pyaara|sweet|friend|dost|shabash|awesome|cool|like you)\b/i.test(text)) {
    const compliments = [
      `Aww, you are the kindest human ever! I love you too!`,
      `Hehe, thank you so much! You make my day brighter!`,
      `Yay! We make the greatest team in the world!`
    ];
    return {
      reply: compliments[Math.floor(Math.random() * compliments.length)],
      emotion: 'HAPPY',
      sound: 'happy',
      actionTrigger: 'tap'
    };
  }

  // Name check / Identity
  if (/\b(who are you|what is your name|whats your name|tum kaun ho|tera naam|apka naam|naam kya)\b/i.test(text)) {
    return {
      reply: `My name is ${companionName}! I am your interactive virtual companion!`,
      emotion: 'WAVE',
      sound: 'happy',
      actionTrigger: 'tap'
    };
  }

  // Goodbye / Alvida
  if (/\b(bye|goodbye|see you|alvida|phir milenge|tata|chalta)\b/i.test(text)) {
    return {
      reply: `Goodbye! Come back soon, I will be right here waiting for you!`,
      emotion: 'WAVE',
      sound: 'happy',
      actionTrigger: 'tap'
    };
  }

  // Intelligent Fallback
  const fallbacks = [
    `I heard you say "${userText}"! That sounds fun!`,
    `Hehe! Tell me more, or we can play a game together!`,
    `I love chatting with you! You can ask me to play, eat, or tell a joke!`,
    `You are awesome! Let us have a great time today!`
  ];
  return {
    reply: fallbacks[Math.floor(Math.random() * fallbacks.length)],
    emotion: 'TALKING',
    sound: 'happy',
    actionTrigger: 'tap'
  };
}
