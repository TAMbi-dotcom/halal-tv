// Halal TV: Russian and Arabic for the on-TV setup page (/setup). English is the source text.
// The language follows the phone remote's choice (tv.lang), then the TV's, then the phone's own.
// T(text, vars) translates one string; localize() swaps the page's own text before its script runs.
(function () {
  'use strict';
  function read(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function pick() {
    var c = read('tv.lang'); if (c && c !== 'auto') return c;
    return read('tv.lang.tv') || navigator.language || 'en';
  }
  var L = /^ru/i.test(pick()) ? 'ru' : (/^ar/i.test(pick()) ? 'ar' : 'en');

  // Whole blocks (an element's inner HTML, spaces squeezed), for paragraphs and list items with <b> or <a>.
  var HTML = {
    ru: {
      'On-TV mode: this page is served by the TV itself. <a href="/">Back to the remote</a>':
        'Режим «на телевизоре»: эту страницу показывает сам телевизор. <a href="/">Назад к пульту</a>',
      'Keys, typing, power off and "what\'s playing" need the TV\'s own debugging switched on. Opening apps and volume work without it.':
        'Для кнопок, ввода текста, выключения и «что сейчас идёт» нужна включённая отладка на самом телевизоре. Открытие приложений и громкость работают и без неё.',
      'On the TV: Settings, System, About, press Build seven times to unlock Developer options.':
        'На телевизоре: Настройки, Система, Об устройстве — нажмите на «Сборка» семь раз, чтобы открыть меню «Для разработчиков».',
      'Settings, System, Developer options, <b>Wireless debugging</b>, switch it on, and on "Allow wireless debugging on this network?" tick <b>Always allow on this network</b> and choose Allow. The TV must be on Wi-Fi.':
        'Настройки, Система, Для разработчиков, <b>Отладка по Wi-Fi</b> — включите её, а на вопрос «Разрешить отладку по Wi-Fi в этой сети?» отметьте <b>Всегда разрешать в этой сети</b> и выберите «Разрешить». Телевизор должен быть подключён к Wi-Fi.',
      'Careful: <b>Revoke USB debugging authorizations</b> sits right next to Wireless debugging in that list. Never press OK on it.':
        'Осторожно: рядом с отладкой по Wi-Fi в этом списке стоит <b>Отозвать разрешения на отладку по USB</b>. Никогда не нажимайте на него OK.',
      'In Wireless debugging choose <b>Pair device with pairing code</b>. Leave that screen open on the TV.':
        'В разделе «Отладка по Wi-Fi» выберите <b>Подключить устройство с помощью кода</b>. Оставьте этот экран открытым на телевизоре.',
      'Type the 6 digit code here. The port is optional (it is found on its own).':
        'Введите здесь код из 6 цифр. Порт можно не указывать (он найдётся сам).',
      'Switch on Developer options and Network (or USB) debugging, press Connect, then on the TV tick <b>Always allow</b> and press Allow. Some newer Google TVs never show that question: use pairing above instead.':
        'Включите меню «Для разработчиков» и отладку по сети (или по USB), нажмите «Подключить», затем на телевизоре отметьте <b>Всегда разрешать</b> и нажмите «Разрешить». Некоторые новые Google TV этот вопрос не показывают: тогда используйте подключение по коду выше.',
      'Any young kids who should only see shows you\'ve picked? I can set up a kids mode with a PIN. Their TV home then shows only the shows you add, and leaving it needs the PIN. Skip this and nothing changes.':
        'Есть маленькие дети, которым можно смотреть только выбранное вами? Можно включить детский режим с PIN-кодом. Их главный экран покажет только добавленные вами передачи, а выйти из него можно только по PIN. Фон, время намаза и уведомления остаются. Пропустите — и ничего не изменится.',
      'The remote\'s PatchWall button opens Halal TV, PatchWall opens Halal TV instead, and Halal TV opens when the TV is switched on, unless the TV is going back to an HDMI input. The Home button is not changed. It needs the Home button watch switched on in Settings, Accessibility (Halal TV home watch); with this on, that watch also checks each remote key for the PatchWall button and passes every other key on.':
        'Кнопка PatchWall на пульте открывает Halal TV, вместо PatchWall открывается Halal TV, и Halal TV появляется при включении телевизора, если он не возвращается на вход HDMI. Кнопка «Домой» не меняется. Нужна включённая служба в Настройках, Спец. возможности (Halal TV home watch); с этой опцией она также проверяет каждую кнопку пульта на PatchWall и пропускает все остальные.',
      'A set-top box, a camera or a games console on an HDMI port can sit in the home\'s app row as its own tile, next to Settings. OK on the tile switches the TV straight to that port. Tick the ports you want and give each a name. Up to 6; they take dock places, so the last apps move behind More apps.':
        'Приставка, камера или игровая консоль на порту HDMI может стоять в ряду приложений отдельной плиткой рядом с Настройками. OK на плитке сразу переключает телевизор на этот порт. Отметьте нужные порты и дайте каждому имя. До 6; они занимают места в ряду, поэтому последние приложения уходят в «Ещё приложения».',
      'Ask lets you say "put on Bluey" and have an AI find it and press the buttons. On-TV mode has no AI until you pick a service and add your own key: Claude, OpenAI, Google Gemini, OpenRouter, Groq, Mistral, or a model running on a computer at home. Use a key made only for this TV, with a monthly spend limit set with the service: the key is stored on the TV, and anyone with ADB access to the TV could read it. Each ask is a few short model calls. On Claude Haiku 5.5 that costs about a fifth of a US cent; other services and models price differently.':
        'Помощник позволяет сказать «включи такую-то передачу», и ИИ сам найдёт её и нажмёт кнопки. В режиме «на телевизоре» ИИ нет, пока вы не выберете сервис и не добавите свой ключ: Claude, OpenAI, Google Gemini, OpenRouter, Groq, Mistral или модель на домашнем компьютере. Используйте ключ только для этого телевизора, с месячным лимитом расходов у сервиса: ключ хранится на телевизоре, и любой с доступом ADB к нему может его прочитать. Каждый запрос — несколько коротких обращений к модели. На Claude Haiku 5.5 это около пятой части цента США; у других сервисов цены другие.'
    },
    ar: {
      'On-TV mode: this page is served by the TV itself. <a href="/">Back to the remote</a>':
        'وضع «على التلفاز»: هذه الصفحة يعرضها التلفاز نفسه. <a href="/">العودة إلى جهاز التحكم</a>',
      'Keys, typing, power off and "what\'s playing" need the TV\'s own debugging switched on. Opening apps and volume work without it.':
        'الأزرار والكتابة والإطفاء و«ما الذي يُعرض الآن» تحتاج إلى تشغيل تصحيح الأخطاء في التلفاز نفسه. فتح التطبيقات ومستوى الصوت يعملان من دونه.',
      'On the TV: Settings, System, About, press Build seven times to unlock Developer options.':
        'على التلفاز: الإعدادات، النظام، حول، اضغط على «رقم الإصدار» سبع مرات لفتح خيارات المطوّرين.',
      'Settings, System, Developer options, <b>Wireless debugging</b>, switch it on, and on "Allow wireless debugging on this network?" tick <b>Always allow on this network</b> and choose Allow. The TV must be on Wi-Fi.':
        'الإعدادات، النظام، خيارات المطوّرين، <b>تصحيح الأخطاء اللاسلكي</b>: شغّله، وعند سؤال «السماح بتصحيح الأخطاء اللاسلكي على هذه الشبكة؟» حدّد <b>السماح دائمًا على هذه الشبكة</b> واختر «سماح». يجب أن يكون التلفاز متصلًا بشبكة Wi-Fi.',
      'Careful: <b>Revoke USB debugging authorizations</b> sits right next to Wireless debugging in that list. Never press OK on it.':
        'انتبه: يوجد <b>إلغاء تفويضات تصحيح أخطاء USB</b> بجانب تصحيح الأخطاء اللاسلكي في تلك القائمة. لا تضغط OK عليه أبدًا.',
      'In Wireless debugging choose <b>Pair device with pairing code</b>. Leave that screen open on the TV.':
        'في تصحيح الأخطاء اللاسلكي اختر <b>إقران الجهاز باستخدام رمز الإقران</b>. اترك تلك الشاشة مفتوحة على التلفاز.',
      'Type the 6 digit code here. The port is optional (it is found on its own).':
        'اكتب الرمز المكوّن من 6 أرقام هنا. المنفذ اختياري (يُعثر عليه تلقائيًا).',
      'Switch on Developer options and Network (or USB) debugging, press Connect, then on the TV tick <b>Always allow</b> and press Allow. Some newer Google TVs never show that question: use pairing above instead.':
        'شغّل خيارات المطوّرين وتصحيح الأخطاء عبر الشبكة (أو عبر USB)، واضغط «اتصال»، ثم حدّد على التلفاز <b>السماح دائمًا</b> واضغط «سماح». بعض أجهزة Google TV الأحدث لا تعرض هذا السؤال أبدًا: استخدم الإقران أعلاه بدلًا منه.',
      'Any young kids who should only see shows you\'ve picked? I can set up a kids mode with a PIN. Their TV home then shows only the shows you add, and leaving it needs the PIN. Skip this and nothing changes.':
        'هل لديك أطفال صغار يجب أن يروا البرامج التي تختارها فقط؟ يمكن إعداد وضع الأطفال برمز PIN. عندها تعرض شاشتهم الرئيسية البرامج التي تضيفها فقط، والخروج منها يحتاج إلى الرمز. الخلفية ومواقيت الصلاة والتنبيهات تبقى ظاهرة. تخطَّ هذا ولن يتغير شيء.',
      'The remote\'s PatchWall button opens Halal TV, PatchWall opens Halal TV instead, and Halal TV opens when the TV is switched on, unless the TV is going back to an HDMI input. The Home button is not changed. It needs the Home button watch switched on in Settings, Accessibility (Halal TV home watch); with this on, that watch also checks each remote key for the PatchWall button and passes every other key on.':
        'زر PatchWall في جهاز التحكم يفتح Halal TV، ويُفتح Halal TV بدلًا من PatchWall، ويظهر Halal TV عند تشغيل التلفاز ما لم يكن عائدًا إلى مدخل HDMI. زر الصفحة الرئيسية لا يتغير. يحتاج ذلك إلى تشغيل الخدمة في الإعدادات، تسهيل الاستخدام (Halal TV home watch)؛ ومع هذا الخيار تفحص الخدمة كل زر بحثًا عن زر PatchWall وتمرّر بقية الأزرار.',
      'A set-top box, a camera or a games console on an HDMI port can sit in the home\'s app row as its own tile, next to Settings. OK on the tile switches the TV straight to that port. Tick the ports you want and give each a name. Up to 6; they take dock places, so the last apps move behind More apps.':
        'يمكن لجهاز الاستقبال أو الكاميرا أو جهاز الألعاب الموصول بمنفذ HDMI أن يظهر كبلاطة مستقلة في صف التطبيقات بجانب الإعدادات. الضغط على OK فوق البلاطة ينقل التلفاز مباشرة إلى ذلك المنفذ. حدّد المنافذ التي تريدها وأعطِ كلًّا منها اسمًا. حتى 6؛ وهي تأخذ أماكن في الصف، فتنتقل آخر التطبيقات إلى «تطبيقات أخرى».',
      'Ask lets you say "put on Bluey" and have an AI find it and press the buttons. On-TV mode has no AI until you pick a service and add your own key: Claude, OpenAI, Google Gemini, OpenRouter, Groq, Mistral, or a model running on a computer at home. Use a key made only for this TV, with a monthly spend limit set with the service: the key is stored on the TV, and anyone with ADB access to the TV could read it. Each ask is a few short model calls. On Claude Haiku 5.5 that costs about a fifth of a US cent; other services and models price differently.':
        'يتيح لك المساعد أن تطلب تشغيل برنامج ما، فيجده الذكاء الاصطناعي ويضغط الأزرار. لا يوجد ذكاء اصطناعي في وضع «على التلفاز» حتى تختار خدمة وتضيف مفتاحك: Claude أو OpenAI أو Google Gemini أو OpenRouter أو Groq أو Mistral أو نموذجًا على حاسوب في المنزل. استخدم مفتاحًا مخصصًا لهذا التلفاز فقط، مع حدّ إنفاق شهري لدى الخدمة: المفتاح محفوظ على التلفاز، ويمكن لأي شخص لديه وصول ADB إلى التلفاز قراءته. كل طلب يعني بضع استدعاءات قصيرة للنموذج. على Claude Haiku 5.5 يكلّف ذلك نحو خُمس سنت أمريكي؛ وتختلف الأسعار في الخدمات والنماذج الأخرى.'
    }
  };

  // Single strings: headings, labels, buttons, and what the page's script writes.
  var S = {
    ru: {
      'TV setup': 'Настройка телевизора',
      'ADB on the TV': 'ADB на телевизоре',
      'Checking…': 'Проверка…',
      'Wireless debugging pairing (Android 11 and newer, best for Google TV)': 'Подключение по коду через отладку по Wi-Fi (Android 11 и новее, лучше для Google TV)',
      'Pairing code': 'Код подключения',
      'Port (optional)': 'Порт (необязательно)',
      'Pair': 'Подключить',
      'Network debugging on port 5555 (older Android TV, Fire TV, Shield)': 'Отладка по сети через порт 5555 (старые Android TV, Fire TV, Shield)',
      'Connect': 'Подключить',
      'Household': 'Дом',
      'TV name': 'Имя телевизора',
      'People (comma separated)': 'Люди (через запятую)',
      'Weather place name': 'Город для погоды и намаза',
      'Latitude': 'Широта',
      'Longitude': 'Долгота',
      'Time zone': 'Часовой пояс',
      'Country (2 letters)': 'Страна (2 буквы)',
      'Save': 'Сохранить',
      'Kids mode (optional, off unless you say yes)': 'Детский режим (по желанию, выключен, пока вы не скажете «да»)',
      'Yes, set up kids mode': 'Да, настроить детский режим',
      'Whose home': 'Чей экран',
      'Parent PIN, 4 to 8 digits': 'Родительский PIN, от 4 до 8 цифр',
      'Turn on kids mode': 'Включить детский режим',
      'Xiaomi: Halal TV in PatchWall\'s place (optional, off by default)': 'Xiaomi: Halal TV вместо PatchWall (по желанию, выключено)',
      'Halal TV in PatchWall\'s place': 'Halal TV вместо PatchWall',
      'Input tiles (optional, off by default)': 'Плитки входов (по желанию, выключено)',
      'Ask (optional, off by default)': 'Помощник (по желанию, выключен)',
      'AI service': 'Сервис ИИ',
      'Web address': 'Веб-адрес',
      'Model name': 'Название модели',
      'API key (leave empty to keep the current one)': 'Ключ API (оставьте пустым, чтобы сохранить текущий)',
      'Switch ask on': 'Включить помощника',
      'Save ask': 'Сохранить',
      'Remove key': 'Удалить ключ',
      'Phones': 'Телефоны',
      'Forget every phone': 'Забыть все телефоны',
      'Connected ({route}).': 'Подключено ({route}).',
      'wireless debugging': 'отладка по Wi-Fi',
      'port 5555': 'порт 5555',
      'Waiting. Accept "Allow debugging?" on the TV.': 'Ждём. Подтвердите «Разрешить отладку?» на телевизоре.',
      'Not connected.': 'Не подключено.',
      'The Home button watch is off: switch on Halal TV home watch in the TV\'s Settings, Accessibility.': 'Служба кнопки «Домой» выключена: включите Halal TV home watch в Настройках телевизора, Спец. возможности.',
      'Phones paired with this TV: {n}.': 'Телефонов подключено к этому телевизору: {n}.',
      'This TV runs Android 13 or newer: use wireless debugging pairing.': 'На этом телевизоре Android 13 или новее: используйте подключение по коду через отладку по Wi-Fi.',
      'Connecting. Look at the TV.': 'Подключаемся. Посмотрите на телевизор.',
      'Done.': 'Готово.',
      'The pairing code has 6 digits.': 'В коде подключения 6 цифр.',
      'Pairing. This can take 20 seconds.': 'Подключаемся. Это может занять 20 секунд.',
      'Paired and connected.': 'Подключено.',
      'Paired. Connecting next.': 'Код принят. Подключаемся.',
      'Saved.': 'Сохранено.',
      'The PIN must be 4 to 8 digits.': 'PIN должен содержать от 4 до 8 цифр.',
      'Kids mode is on for {name}. Add their shows on the phone remote: TV, Kids mode.': 'Детский режим для {name} включён. Добавьте передачи в пульте на телефоне: ТВ, Детский режим.',
      'the model name your service gives you': 'название модели от вашего сервиса',
      'A key is saved.': 'Ключ сохранён.',
      'This server needs no key.': 'Этому серверу ключ не нужен.',
      'No key saved.': 'Ключ не сохранён.',
      'Ready.': 'Готово к работе.',
      'Type a model name.': 'Введите название модели.',
      'Saved. If you changed the service, type its key too: a key is never sent to a different service.': 'Сохранено. Если вы сменили сервис, введите и его ключ: ключ никогда не отправляется другому сервису.',
      'Input {n}': 'Вход {n}',
      'Name on the tile, for example Set-top box': 'Имя на плитке, например «Приставка»',
      'Saved. The home shows them now.': 'Сохранено. Плитки уже на главном экране.',
      'Saved. No input tiles.': 'Сохранено. Плиток входов нет.',
      'Key removed.': 'Ключ удалён.',
      'Every phone, including this one, will need the code from the TV again.': 'Всем телефонам, включая этот, снова понадобится код с телевизора.',
      'Get a key in the Anthropic Console. Claude Haiku 5.5 is the tested default.': 'Ключ можно получить в Anthropic Console. Проверенная модель по умолчанию — Claude Haiku 5.5.',
      'Get a key at platform.openai.com. Type a model name that can call tools.': 'Ключ можно получить на platform.openai.com. Укажите модель, которая умеет вызывать инструменты.',
      'Get a key in Google AI Studio. This is Gemini\'s OpenAI compatible address.': 'Ключ можно получить в Google AI Studio. Это адрес Gemini, совместимый с OpenAI.',
      'Model names look like provider/model.': 'Названия моделей выглядят как провайдер/модель.',
      'Pick a model that supports tool use.': 'Выберите модель, которая умеет вызывать инструменты.',
      'Get a key at console.mistral.ai.': 'Ключ можно получить на console.mistral.ai.',
      'Change the address to your computer\'s. It needs no key, but only a model that supports tool calling will work. It must be on your home network.': 'Замените адрес на адрес своего компьютера. Ключ не нужен, но работать будет только модель с вызовом инструментов. Компьютер должен быть в домашней сети.',
      'Type its web address, the one that ends in /v1, and its model name.': 'Введите его веб-адрес (тот, что заканчивается на /v1) и название модели.',
      'OpenRouter (many models, one key)': 'OpenRouter (много моделей, один ключ)',
      'A model at home (Ollama, LM Studio, llama.cpp)': 'Модель дома (Ollama, LM Studio, llama.cpp)',
      'Another service that copies OpenAI\'s API': 'Другой сервис с API как у OpenAI'
    },
    ar: {
      'TV setup': 'إعداد التلفاز',
      'ADB on the TV': 'ADB على التلفاز',
      'Checking…': 'جارٍ التحقق…',
      'Wireless debugging pairing (Android 11 and newer, best for Google TV)': 'الإقران عبر تصحيح الأخطاء اللاسلكي (Android 11 والأحدث، الأفضل لـ Google TV)',
      'Pairing code': 'رمز الإقران',
      'Port (optional)': 'المنفذ (اختياري)',
      'Pair': 'إقران',
      'Network debugging on port 5555 (older Android TV, Fire TV, Shield)': 'تصحيح الأخطاء عبر الشبكة على المنفذ 5555 (أجهزة Android TV الأقدم، Fire TV، Shield)',
      'Connect': 'اتصال',
      'Household': 'المنزل',
      'TV name': 'اسم التلفاز',
      'People (comma separated)': 'الأشخاص (مفصولون بفواصل)',
      'Weather place name': 'المدينة للطقس ومواقيت الصلاة',
      'Latitude': 'خط العرض',
      'Longitude': 'خط الطول',
      'Time zone': 'المنطقة الزمنية',
      'Country (2 letters)': 'الدولة (حرفان)',
      'Save': 'حفظ',
      'Kids mode (optional, off unless you say yes)': 'وضع الأطفال (اختياري، متوقف ما لم توافق)',
      'Yes, set up kids mode': 'نعم، أعدّ وضع الأطفال',
      'Whose home': 'شاشة من',
      'Parent PIN, 4 to 8 digits': 'رمز PIN للوالدين، من 4 إلى 8 أرقام',
      'Turn on kids mode': 'تشغيل وضع الأطفال',
      'Xiaomi: Halal TV in PatchWall\'s place (optional, off by default)': 'Xiaomi: ‏Halal TV مكان PatchWall (اختياري، متوقف افتراضيًا)',
      'Halal TV in PatchWall\'s place': 'Halal TV مكان PatchWall',
      'Input tiles (optional, off by default)': 'بلاطات المداخل (اختياري، متوقف افتراضيًا)',
      'Ask (optional, off by default)': 'المساعد (اختياري، متوقف افتراضيًا)',
      'AI service': 'خدمة الذكاء الاصطناعي',
      'Web address': 'عنوان الويب',
      'Model name': 'اسم النموذج',
      'API key (leave empty to keep the current one)': 'مفتاح API (اتركه فارغًا للإبقاء على المفتاح الحالي)',
      'Switch ask on': 'تشغيل المساعد',
      'Save ask': 'حفظ',
      'Remove key': 'حذف المفتاح',
      'Phones': 'الهواتف',
      'Forget every phone': 'نسيان كل الهواتف',
      'Connected ({route}).': 'متصل ({route}).',
      'wireless debugging': 'تصحيح الأخطاء اللاسلكي',
      'port 5555': 'المنفذ 5555',
      'Waiting. Accept "Allow debugging?" on the TV.': 'بانتظار الموافقة. اقبل «السماح بتصحيح الأخطاء؟» على التلفاز.',
      'Not connected.': 'غير متصل.',
      'The Home button watch is off: switch on Halal TV home watch in the TV\'s Settings, Accessibility.': 'خدمة زر الصفحة الرئيسية متوقفة: شغّل Halal TV home watch في إعدادات التلفاز، تسهيل الاستخدام.',
      'Phones paired with this TV: {n}.': 'الهواتف المقترنة بهذا التلفاز: {n}.',
      'This TV runs Android 13 or newer: use wireless debugging pairing.': 'يعمل هذا التلفاز بنظام Android 13 أو أحدث: استخدم الإقران عبر تصحيح الأخطاء اللاسلكي.',
      'Connecting. Look at the TV.': 'جارٍ الاتصال. انظر إلى التلفاز.',
      'Done.': 'تم.',
      'The pairing code has 6 digits.': 'رمز الإقران مكوّن من 6 أرقام.',
      'Pairing. This can take 20 seconds.': 'جارٍ الإقران. قد يستغرق ذلك 20 ثانية.',
      'Paired and connected.': 'تم الإقران والاتصال.',
      'Paired. Connecting next.': 'تم الإقران. جارٍ الاتصال.',
      'Saved.': 'تم الحفظ.',
      'The PIN must be 4 to 8 digits.': 'يجب أن يتكون رمز PIN من 4 إلى 8 أرقام.',
      'Kids mode is on for {name}. Add their shows on the phone remote: TV, Kids mode.': 'وضع الأطفال مفعّل لـ {name}. أضف برامجهم من جهاز التحكم في الهاتف: التلفاز، وضع الأطفال.',
      'the model name your service gives you': 'اسم النموذج الذي تعطيك إياه خدمتك',
      'A key is saved.': 'المفتاح محفوظ.',
      'This server needs no key.': 'هذا الخادم لا يحتاج إلى مفتاح.',
      'No key saved.': 'لا يوجد مفتاح محفوظ.',
      'Ready.': 'جاهز.',
      'Type a model name.': 'اكتب اسم النموذج.',
      'Saved. If you changed the service, type its key too: a key is never sent to a different service.': 'تم الحفظ. إذا غيّرت الخدمة فاكتب مفتاحها أيضًا: لا يُرسل المفتاح أبدًا إلى خدمة أخرى.',
      'Input {n}': 'المدخل {n}',
      'Name on the tile, for example Set-top box': 'الاسم على البلاطة، مثل «جهاز الاستقبال»',
      'Saved. The home shows them now.': 'تم الحفظ. تظهر الآن في الشاشة الرئيسية.',
      'Saved. No input tiles.': 'تم الحفظ. لا توجد بلاطات مداخل.',
      'Key removed.': 'تم حذف المفتاح.',
      'Every phone, including this one, will need the code from the TV again.': 'سيحتاج كل هاتف، بما فيه هذا الهاتف، إلى الرمز من التلفاز مرة أخرى.',
      'Get a key in the Anthropic Console. Claude Haiku 5.5 is the tested default.': 'احصل على مفتاح من Anthropic Console. النموذج الافتراضي المختبر هو Claude Haiku 5.5.',
      'Get a key at platform.openai.com. Type a model name that can call tools.': 'احصل على مفتاح من platform.openai.com. اكتب اسم نموذج يستطيع استدعاء الأدوات.',
      'Get a key in Google AI Studio. This is Gemini\'s OpenAI compatible address.': 'احصل على مفتاح من Google AI Studio. هذا عنوان Gemini المتوافق مع OpenAI.',
      'Model names look like provider/model.': 'أسماء النماذج بالشكل provider/model.',
      'Pick a model that supports tool use.': 'اختر نموذجًا يدعم استدعاء الأدوات.',
      'Get a key at console.mistral.ai.': 'احصل على مفتاح من console.mistral.ai.',
      'Change the address to your computer\'s. It needs no key, but only a model that supports tool calling will work. It must be on your home network.': 'غيّر العنوان إلى عنوان حاسوبك. لا يحتاج إلى مفتاح، لكن لن يعمل إلا نموذج يدعم استدعاء الأدوات. يجب أن يكون على شبكتك المنزلية.',
      'Type its web address, the one that ends in /v1, and its model name.': 'اكتب عنوان الويب الخاص بها (الذي ينتهي بـ ‎/v1) واسم النموذج.',
      'OpenRouter (many models, one key)': 'OpenRouter (نماذج كثيرة، مفتاح واحد)',
      'A model at home (Ollama, LM Studio, llama.cpp)': 'نموذج في المنزل (Ollama، LM Studio، llama.cpp)',
      'Another service that copies OpenAI\'s API': 'خدمة أخرى بواجهة API مثل OpenAI'
    }
  };

  function squeeze(s) { return String(s).replace(/\s+/g, ' ').trim(); }
  function T(en, vars) {
    var s = (S[L] && S[L][en]) || en;
    if (vars) s = s.replace(/\{(\w+)\}/g, function (m, k) { return vars[k] !== undefined ? vars[k] : m; });
    return s;
  }
  function localize(root) {
    if (L === 'en') return;
    document.documentElement.lang = L;
    if (L === 'ar') document.documentElement.dir = 'rtl';
    document.title = T(document.title);
    var blocks = (root || document).querySelectorAll('p, li');
    Array.prototype.forEach.call(blocks, function (el) {
      var t = HTML[L][squeeze(el.innerHTML)];
      if (t) el.innerHTML = t;
    });
    var walk = document.createTreeWalker(root || document.body, NodeFilter.SHOW_TEXT, null, false), n, todo = [];
    while ((n = walk.nextNode())) todo.push(n);
    todo.forEach(function (node) {
      var k = squeeze(node.nodeValue);
      if (k && S[L][k]) node.nodeValue = node.nodeValue.replace(k, S[L][k]);
    });
    Array.prototype.forEach.call(document.querySelectorAll('[placeholder]'), function (el) {
      el.placeholder = T(el.placeholder);
    });
  }
  window.halalI18n = { lang: L, T: T, localize: localize };
})();
