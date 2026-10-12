import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DOGS = [
  { name: "Боня", breed: "Лабрадор", gender: "FEMALE", ageGroup: "ADULT", district: "CENTER", goal: "WALK" },
  { name: "Рич", breed: "Хаски", gender: "MALE", ageGroup: "ADULT", district: "LEVENTSOVKA", goal: "WALK" },
  { name: "Муся", breed: "Корги", gender: "FEMALE", ageGroup: "ADULT", district: "ZHM", goal: "MATE" },
  { name: "Патрон", breed: "Джек-рассел-терьер", gender: "MALE", ageGroup: "ADULT", district: "SUVOROVSKY", goal: "WALK" },
  { name: "Ириска", breed: "Шпиц", gender: "FEMALE", ageGroup: "PUPPY", district: "SZHM", goal: "WALK" },
  { name: "Барон", breed: "Немецкая овчарка", gender: "MALE", ageGroup: "ADULT", district: "VOENVED", goal: "MATE" },
  { name: "Лаки", breed: "Бигль", gender: "MALE", ageGroup: "PUPPY", district: "NAKHICHEVAN", goal: "WALK" },
  { name: "Фишка", breed: "Такса", gender: "FEMALE", ageGroup: "ADULT", district: "SELMASH", goal: "WALK" },
  { name: "Грей", breed: "Бордер-колли", gender: "MALE", ageGroup: "ADULT", district: "ALEXANDROVKA", goal: "WALK" },
  { name: "Молли", breed: "Голден-ретривер", gender: "FEMALE", ageGroup: "ADULT", district: "KRASNY_AKSAY", goal: "MATE" },
  { name: "Чиз", breed: "Чихуахуа", gender: "MALE", ageGroup: "ADULT", district: "CENTER", goal: "WALK" },
  { name: "Пуша", breed: "Мопс", gender: "FEMALE", ageGroup: "ADULT", district: "ZHM", goal: "WALK" },
  { name: "Шарик", breed: "Метис", gender: "MALE", ageGroup: "ADULT", district: "LEVENTSOVKA", goal: "WALK" },
  { name: "Ася", breed: "Той-терьер", gender: "FEMALE", ageGroup: "PUPPY", district: "SUVOROVSKY", goal: "WALK" },
  { name: "Нюша", breed: "Такса", gender: "FEMALE", ageGroup: "ADULT", district: "ZHM", goal: "WALK" },
  { name: "Рекс", breed: "Доберман", gender: "MALE", ageGroup: "ADULT", district: "VOENVED", goal: "WALK" },
  { name: "Жужа", breed: "Пудель", gender: "FEMALE", ageGroup: "ADULT", district: "CENTER", goal: "MATE" },
  { name: "Степан", breed: "Акита-ину", gender: "MALE", ageGroup: "ADULT", district: "SUVOROVSKY", goal: "WALK" },
  { name: "Белка", breed: "Хаски", gender: "FEMALE", ageGroup: "PUPPY", district: "SZHM", goal: "WALK" },
  { name: "Персик", breed: "Французский бульдог", gender: "MALE", ageGroup: "ADULT", district: "KRASNY_AKSAY", goal: "WALK" },
  { name: "Злата", breed: "Самоед", gender: "FEMALE", ageGroup: "ADULT", district: "LEVENTSOVKA", goal: "MATE" },
  { name: "Байкал", breed: "Кавказская овчарка", gender: "MALE", ageGroup: "ADULT", district: "ALEXANDROVKA", goal: "WALK" },
  { name: "Веста", breed: "Ротвейлер", gender: "FEMALE", ageGroup: "ADULT", district: "NAKHICHEVAN", goal: "WALK" },
  { name: "Том", breed: "Джек-рассел-терьер", gender: "MALE", ageGroup: "PUPPY", district: "SELMASH", goal: "WALK" },
  { name: "Люси", breed: "Бассет-хаунд", gender: "FEMALE", ageGroup: "ADULT", district: "ZHM", goal: "WALK" },
  { name: "Гром", breed: "Немецкая овчарка", gender: "MALE", ageGroup: "ADULT", district: "CENTER", goal: "MATE" },
  { name: "Марта", breed: "Ши-тцу", gender: "FEMALE", ageGroup: "ADULT", district: "VOENVED", goal: "WALK" },
  { name: "Феликс", breed: "Кане-корсо", gender: "MALE", ageGroup: "ADULT", district: "SUVOROVSKY", goal: "WALK" },
  // Этот пёс уже лайкнул анкету демо-пользователя — на нём сразу будет мэтч.
  { name: "Дружок", breed: "Метис", gender: "MALE", ageGroup: "ADULT", district: "CENTER", goal: "WALK" },
] as const;

const LANDMARKS = [
  { lat: 47.2601, lng: 39.7386 }, // парк им. Островского
  { lat: 47.2217, lng: 39.7161 }, // Публичка (центр)
  { lat: 47.2504, lng: 39.6056 }, // Левенцовка
  { lat: 47.31, lng: 39.72 }, // Щепкинский лес
  { lat: 47.2089, lng: 39.641 }, // Красный Аксай
  { lat: 47.2856, lng: 39.6513 }, // Суворовский
];

async function main() {
  console.log("Очищаем базу...");
  await prisma.groupMember.deleteMany();
  await prisma.post.deleteMany();
  await prisma.group.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.meetupParticipant.deleteMany();
  await prisma.meetup.deleteMany();
  await prisma.match.deleteMany();
  await prisma.like.deleteMany();
  await prisma.walkSession.deleteMany();
  await prisma.dogProfile.deleteMany();
  await prisma.user.deleteMany();

  console.log("Создаём демо-пользователя (телеграм id=0, под него заходит dev-режим)...");
  const demoUser = await prisma.user.create({
    data: { telegramId: "0", username: "dev_user", firstName: "Тестовый хозяин" },
  });
  const demoDog = await prisma.dogProfile.create({
    data: {
      userId: demoUser.id,
      name: "Макс",
      breed: "Дворняга",
      gender: "MALE",
      ageGroup: "ADULT",
      district: "CENTER",
      goal: "WALK",
    },
  });

  console.log(`Создаём ${DOGS.length} демо-собак и их хозяев...`);
  const createdDogs: Awaited<ReturnType<typeof prisma.dogProfile.create>>[] = [];
  for (let i = 0; i < DOGS.length; i++) {
    const d = DOGS[i];
    const user = await prisma.user.create({
      data: {
        telegramId: String(1000 + i + 1),
        username: `dog_owner_${i + 1}`,
        firstName: `Хозяин ${i + 1}`,
      },
    });
    const dog = await prisma.dogProfile.create({
      data: {
        userId: user.id,
        name: d.name,
        breed: d.breed,
        gender: d.gender as any,
        ageGroup: d.ageGroup as any,
        district: d.district as any,
        goal: d.goal as any,
      },
    });
    createdDogs.push(dog);
  }
  const byName = (name: string) => createdDogs.find((d) => d.name === name)!;

  console.log("Включаем активные прогулки на карте...");
  const now = Date.now();
  const walkerNames = ["Боня", "Рич", "Лаки", "Шарик", "Злата", "Байкал", "Том"];
  for (let i = 0; i < walkerNames.length; i++) {
    const spot = LANDMARKS[i % LANDMARKS.length];
    await prisma.walkSession.create({
      data: {
        dogProfileId: byName(walkerNames[i]).id,
        lat: spot.lat + (Math.random() - 0.5) * 0.004,
        lng: spot.lng + (Math.random() - 0.5) * 0.004,
        startedAt: new Date(now - 5 * 60 * 1000),
        expiresAt: new Date(now + 55 * 60 * 1000),
      },
    });
  }

  console.log("Дружок уже лайкнул демо-пользователя — на нём будет мгновенный мэтч...");
  const druzhok = byName("Дружок");
  await prisma.like.create({ data: { fromDogId: druzhok.id, toDogId: demoDog.id } });

  console.log("Публикуем посты в ленту (на разные даты, для живой хроники)...");
  const POSTS: { dog: string; caption: string; hoursAgo: number }[] = [
    { dog: "Боня", caption: "Утренняя пробежка в парке Островского — Боня в полном восторге! 🐾", hoursAgo: 3 },
    { dog: "Лаки", caption: "Лаки наконец научился сидеть по команде. Маленькая победа, но наша!", hoursAgo: 6 },
    { dog: "Шарик", caption: "Шарик встретил новых друзей на площадке в Левенцовке сегодня 🐶", hoursAgo: 9 },
    { dog: "Рич", caption: "Снег ещё не выпал, а Рич уже мечтает о зиме ❄️ Хаски есть хаски.", hoursAgo: 14 },
    { dog: "Муся", caption: "Корги-митап в субботу — кто ещё придёт с коротколапыми?", hoursAgo: 20 },
    { dog: "Молли", caption: "Молли освоила команду «рядом». Голден-ретриверы — лучшие ученики!", hoursAgo: 27 },
    { dog: "Жужа", caption: "Постригли Жужу к зиме — делимся фото стрижки пуделя 💇", hoursAgo: 33 },
    { dog: "Злата", caption: "Самоедская улыбка никого не оставляет равнодушным на набережной 😄", hoursAgo: 40 },
    { dog: "Байкал", caption: "Байкал охраняет двор серьёзно, но после прогулки превращается в пушистика.", hoursAgo: 48 },
    { dog: "Персик", caption: "Персик впервые увидел кота. Немая сцена длилась минуты три.", hoursAgo: 55 },
    { dog: "Гром", caption: "Ищем пару для вязки — Гром, немецкая овчарка, родословная есть.", hoursAgo: 62 },
    { dog: "Люси", caption: "Бассет-хаунд и лужи после дождя — история любви без конца.", hoursAgo: 70 },
    { dog: "Фишка", caption: "Такса Фишка прорыла нору под забором. Инженер в собачьем теле.", hoursAgo: 80 },
    { dog: "Патрон", caption: "Патрон прошёл первый курс дрессировки на отлично!", hoursAgo: 95 },
    { dog: "Степан", caption: "Акита-ину и первый снег — Степан в шоке от холодных лап.", hoursAgo: 110 },
    { dog: "Веста", caption: "Веста подружилась с соседским котом. Кто бы мог подумать.", hoursAgo: 130 },
  ];
  for (const p of POSTS) {
    await prisma.post.create({
      data: {
        dogProfileId: byName(p.dog).id,
        caption: p.caption,
        createdAt: new Date(now - p.hoursAgo * 60 * 60 * 1000),
      },
    });
  }

  console.log("Создаём группы (демо-юзер ни в одну не входит — показывает пустое состояние)...");
  const GROUPS = [
    {
      name: "Собачники Левенцовки",
      description: "Соседский чат для прогулок, советов и совместных вылазок в Левенцовке.",
      creator: "Рич",
      members: ["Рич", "Шарик", "Злата"],
      posts: [{ dog: "Рич", caption: "Собираемся в субботу у шлагбаума в 10:00, кто с нами? 🐾", hoursAgo: 2 }],
    },
    {
      name: "Щенки Ростова",
      description: "Поддержка и советы для хозяев щенков: воспитание, здоровье, первые шаги.",
      creator: "Ириска",
      members: ["Ириска", "Лаки", "Ася", "Белка", "Том"],
      posts: [
        { dog: "Ириска", caption: "Подскажите хорошего кинолога для щенка 4 месяцев в центре?", hoursAgo: 5 },
        { dog: "Белка", caption: "Белка первый раз увидела поводок и обиделась на полдня 😂", hoursAgo: 26 },
      ],
    },
    {
      name: "Бегущие с собаками",
      description: "Утренние пробежки и канихайкинг для активных собак и их хозяев.",
      creator: "Грей",
      members: ["Грей", "Байкал", "Степан", "Веста"],
      posts: [{ dog: "Грей", caption: "В воскресенье бежим 5 км вдоль набережной, старт в 8:00!", hoursAgo: 12 }],
    },
    {
      name: "ЗооЗабота Ростов",
      description: "Потеряшки, проверенные ветеринары и всё для здоровья ваших собак.",
      creator: "Молли",
      members: ["Молли", "Барон", "Чиз", "Марта"],
      posts: [
        { dog: "Барон", caption: "Кто посоветует ветклинику в Военведе с хорошим хирургом?", hoursAgo: 18 },
      ],
    },
  ];
  for (const g of GROUPS) {
    const group = await prisma.group.create({
      data: { name: g.name, description: g.description, creatorDogId: byName(g.creator).id },
    });
    for (const memberName of g.members) {
      await prisma.groupMember.create({ data: { groupId: group.id, dogProfileId: byName(memberName).id } });
    }
    for (const p of g.posts) {
      await prisma.post.create({
        data: {
          dogProfileId: byName(p.dog).id,
          groupId: group.id,
          caption: p.caption,
          createdAt: new Date(now - p.hoursAgo * 60 * 60 * 1000),
        },
      });
    }
  }

  console.log("Строим граф подписок между соседями для реалистичных счётчиков...");
  const FOLLOWS: [string, string][] = [
    ["Боня", "Лаки"],
    ["Рич", "Лаки"],
    ["Лаки", "Боня"],
    ["Муся", "Жужа"],
    ["Жужа", "Злата"],
    ["Злата", "Байкал"],
    ["Байкал", "Степан"],
    ["Степан", "Грей"],
    ["Грей", "Веста"],
    ["Веста", "Байкал"],
    ["Молли", "Барон"],
    ["Барон", "Чиз"],
    ["Чиз", "Молли"],
    ["Фишка", "Патрон"],
    ["Патрон", "Гром"],
    ["Ириска", "Белка"],
    ["Белка", "Том"],
    ["Том", "Ася"],
    ["Ася", "Ириска"],
    ["Персик", "Люси"],
    ["Люси", "Марта"],
    ["Пуша", "Нюша"],
    ["Нюша", "Рекс"],
  ];
  for (const [from, to] of FOLLOWS) {
    await prisma.follow.create({ data: { followerDogId: byName(from).id, followingDogId: byName(to).id } });
  }

  console.log("Создаём встречи в афише...");
  const MEETUPS = [
    {
      organizer: "Боня",
      title: "Собираем мопсов и не только 🐾",
      description: "Воскресенье, встречаемся у фонтана, гуляем и знакомим собак. Ждём всех дружелюбных!",
      district: "CENTER",
      placeName: "Парк Плевен, возле фонтана",
      lat: 47.2217,
      lng: 39.7161,
      daysAhead: 3,
    },
    {
      organizer: "Грей",
      title: "Пробежка выходного дня",
      description: "Лёгкие 5 км вдоль набережной в комфортном темпе, с остановками на отдых и воду.",
      district: "VOENVED",
      placeName: "Набережная, у речного вокзала",
      lat: 47.2217,
      lng: 39.72,
      daysAhead: 5,
    },
    {
      organizer: "Рич",
      title: "Вечерняя прогулка в Левенцовке",
      description: "Собираемся после работы, гуляем компанией, щенки тоже приветствуются.",
      district: "LEVENTSOVKA",
      placeName: "Сквер у шлагбаума",
      lat: 47.2504,
      lng: 39.6056,
      daysAhead: 2,
    },
    {
      organizer: "Молли",
      title: "Фотопрогулка с собаками",
      description: "Зовём фотографа-любителя сделать красивые кадры ваших питомцев на фоне осеннего парка.",
      district: "KRASNY_AKSAY",
      placeName: "Парк Казачьей Славы",
      lat: 47.2089,
      lng: 39.641,
      daysAhead: 7,
    },
  ];
  for (const m of MEETUPS) {
    await prisma.meetup.create({
      data: {
        organizerDogId: byName(m.organizer).id,
        title: m.title,
        description: m.description,
        district: m.district,
        placeName: m.placeName,
        lat: m.lat,
        lng: m.lng,
        scheduledAt: new Date(now + m.daysAhead * 24 * 60 * 60 * 1000),
      },
    });
  }

  console.log("Готово!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
