// Sprachwahl und Übersetzung der sichtbaren Bedienelemente.
// Die Sprache bleibt auf diesem Gerät gespeichert und wird nicht mit Arbeitszeitdaten vermischt.
const APP_LOCALES = { de:"de-DE", ru:"ru-RU", uk:"uk-UA", tr:"tr-TR", pl:"pl-PL", ro:"ro-RO", ar:"ar", sq:"sq-AL", en:"en-GB", sl:"sl-SI" };
const APP_LANGUAGE_OPTIONS = ["de","ru","uk","tr","pl","ro","ar","sq","en","sl"];
let APP_LANGUAGE = (()=>{
  try { const value=localStorage.getItem("stundenzettel_sprache"); return APP_LANGUAGE_OPTIONS.includes(value)?value:"de"; }
  catch(e){ return "de"; }
})();

const APP_TRANSLATIONS = {
  "Sprache wählen":["Выбрать язык","Вибрати мову","Dil seçin","Wybierz język","Alege limba","اختر اللغة","Zgjidh gjuhën","Choose language"],
  "Stundenzettel":["Табель рабочего времени","Табель робочого часу","Çalışma çizelgesi","Ewidencja czasu pracy","Pontaj","سجل الدوام","Fletë-orari","Timesheet"],
  "Mo":["Пн","Пн","Pzt","Pon","Lu","ن","Hën","Mon"],"Di":["Вт","Вт","Sal","Wto","Ma","ث","Mar","Tue"],"Mi":["Ср","Ср","Çar","Śro","Mi","ر","Mër","Wed"],"Do":["Чт","Чт","Per","Czw","Jo","خ","Enj","Thu"],"Fr":["Пт","Пт","Cum","Pt","Vi","ج","Pre","Fri"],"Sa":["Сб","Сб","Cmt","Sob","Sâ","س","Sht","Sat"],"So":["Вс","Нд","Paz","Nie","Du","ح","Die","Sun"],
  "Menü":["Меню","Меню","Menü","Menu","Meniu","القائمة","Menyja","Menu"],
  "Vorheriger Monat":["Предыдущий месяц","Попередній місяць","Önceki ay","Poprzedni miesiąc","Luna anterioară","الشهر السابق","Muaji i kaluar","Previous month"],
  "Nächster Monat":["Следующий месяц","Наступний місяць","Sonraki ay","Następny miesiąc","Luna următoare","الشهر التالي","Muaji i ardhshëm","Next month"],
  "Monatssumme":["Итого за месяц","Підсумок за місяць","Aylık toplam","Suma miesięczna","Total lunar","مجموع الشهر","Gjithsej mujor","Monthly total"],
  " Std.":[" ч"," год"," sa"," godz."," ore"," س"," orë"," hrs"],
  "📎 Per E-Mail senden (mit Excel)":["📎 Отправить по эл. почте (с Excel)","📎 Надіслати електронною поштою (з Excel)","📎 E-posta ile gönder (Excel ekli)","📎 Wyślij e-mailem (z Excelem)","📎 Trimite prin e-mail (cu Excel)","📎 إرسال بالبريد الإلكتروني (مع Excel)","📎 Dërgo me email (me Excel)","📎 Send by email (with Excel)"],
  "⧉ E-Mail-Text kopieren (falls sich keine Mail-App öffnet)":["⧉ Скопировать текст письма (если почта не открывается)","⧉ Скопіювати текст листа (якщо пошта не відкривається)","⧉ E-posta metnini kopyala (posta uygulaması açılmazsa)","⧉ Kopiuj treść e-maila (jeśli aplikacja pocztowa się nie otworzy)","⧉ Copiază textul e-mailului (dacă aplicația nu se deschide)","⧉ نسخ نص البريد الإلكتروني (إذا لم يفتح تطبيق البريد)","⧉ Kopjo tekstin e emailit (nëse aplikacioni nuk hapet)","⧉ Copy email text (if no mail app opens)"],
  "📎 Excel-Datei herunterladen":["📎 Скачать файл Excel","📎 Завантажити файл Excel","📎 Excel dosyasını indir","📎 Pobierz plik Excel","📎 Descarcă fișierul Excel","📎 تنزيل ملف Excel","📎 Shkarko skedarin Excel","📎 Download Excel file"],
  "📖 Benutzeranleitung":["📖 Инструкция пользователя","📖 Посібник користувача","📖 Kullanım kılavuzu","📖 Instrukcja użytkownika","📖 Ghidul utilizatorului","📖 دليل المستخدم","📖 Udhëzuesi i përdoruesit","📖 User guide"],
  "👤 Adminbereich":["👤 Настройки","👤 Адміністрування","👤 Yönetim alanı","👤 Panel administracyjny","👤 Administrare","👤 لوحة الإدارة","👤 Paneli i administratorit","👤 Admin area"],
  "Adminbereich":["Настройки","Адміністрування","Yönetim alanı","Panel administracyjny","Administrare","لوحة الإدارة","Paneli i administratorit","Admin area"],
  "Vorname":["Имя","Ім’я","Ad","Imię","Prenume","الاسم الأول","Emri","First name"],
  "Name":["Фамилия","Прізвище","Soyadı","Nazwisko","Nume","اسم العائلة","Mbiemri","Last name"],
  "Personalnummer":["Табельный номер","Табельний номер","Personel numarası","Numer pracownika","Număr personal","رقم الموظف","Numri i punonjësit","Employee number"],
  "E-Mail Empfänger (Arbeitgeber)":["Электронная почта получателя (работодатель)","Електронна пошта одержувача (роботодавець)","E-posta alıcısı (işveren)","Adres e-mail odbiorcy (pracodawca)","E-mail destinatar (angajator)","بريد المستلم (صاحب العمل)","Email-i i marrësit (punëdhënësi)","Email recipient (employer)"],
  "Zeiteingabe":["Ввод времени","Введення часу","Saat girişi","Wprowadzanie czasu","Introducerea orei","إدخال الوقت","Futja e orës","Time entry"],
  "Ziffernblatt (bisher)":["Циферблат (текущий)","Циферблат (поточний)","Kadran (mevcut)","Tarcza zegara (obecna)","Cadran (actual)","قرص الساعة (الحالي)","Fusha e orës (aktuale)","Clock face (current)"],
  "24‑Stunden-Rad (Stunden und Minuten)":["24-часовое колесо (часы и минуты)","24-годинне колесо (години та хвилини)","24 saatlik döner seçici (saat ve dakika)","Koło 24-godzinne (godziny i minuty)","Selector rotativ de 24 de ore (ore și minute)","عجلة 24 ساعة (الساعات والدقائق)","Rrotë 24-orëshe (orë dhe minuta)","24-hour wheel (hours and minutes)"],
  "Übliche Arbeitstage (optional)":["Обычные рабочие дни (необязательно)","Звичайні робочі дні (необов’язково)","Normal çalışma günleri (isteğe bağlı)","Zwykłe dni pracy (opcjonalnie)","Zile obișnuite de lucru (opțional)","أيام العمل المعتادة (اختياري)","Ditët e zakonshme të punës (opsionale)","Usual workdays (optional)"],
  "Vergangene ausgewählte Arbeitstage ohne Buchung oder Abwesenheitsstatus werden in der Monatsprüfung angezeigt.":["Прошедшие выбранные рабочие дни без записи или статуса отсутствия появятся в проверке месяца.","Минулі вибрані робочі дні без запису або статусу відсутності відображатимуться під час перевірки місяця.","Kayıt veya devamsızlık durumu olmayan geçmiş çalışma günleri aylık kontrolde gösterilir.","Minione wybrane dni pracy bez wpisu lub statusu nieobecności pojawią się w kontroli miesiąca.","Zilele de lucru selectate din trecut, fără pontaj sau absență, vor apărea la verificarea lunii.","ستظهر أيام العمل السابقة المحددة دون تسجيل أو حالة غياب في مراجعة الشهر.","Ditët e kaluara të zgjedhura të punës pa regjistrim ose mungesë shfaqen në kontrollin mujor.","Past selected workdays without an entry or absence status appear in the monthly check."],
  "Meine Projekte (je eine Zeile)":["Мои проекты (по одному в строке)","Мої проєкти (по одному в рядку)","Projelerim (her satıra bir tane)","Moje projekty (po jednym w wierszu)","Proiectele mele (unul pe rând)","مشاريعي (مشروع واحد في كل سطر)","Projektet e mia (një për rresht)","My projects (one per line)"],
  "Gespeicherte und bereits verwendete Projekte erscheinen als Vorschläge.":["Сохранённые и ранее использованные проекты будут предлагаться.","Збережені та вже використані проєкти з’являтимуться як підказки.","Kaydedilen ve daha önce kullanılan projeler öneri olarak görünür.","Zapisane i wcześniej używane projekty będą podpowiadane.","Proiectele salvate și folosite anterior vor apărea ca sugestii.","ستظهر المشاريع المحفوظة والمستخدمة سابقًا كاقتراحات.","Projektet e ruajtura dhe të përdorura më parë shfaqen si sugjerime.","Saved and previously used projects appear as suggestions."],
  "⬇ Datensicherung herunterladen":["⬇ Скачать резервную копию","⬇ Завантажити резервну копію","⬇ Yedeklemeyi indir","⬇ Pobierz kopię zapasową","⬇ Descarcă copia de siguranță","⬇ تنزيل نسخة احتياطية","⬇ Shkarko kopjen rezervë","⬇ Download backup"],
  "⬆ Datensicherung wiederherstellen":["⬆ Восстановить из резервной копии","⬆ Відновити резервну копію","⬆ Yedeklemeyi geri yükle","⬆ Przywróć kopię zapasową","⬆ Restaurează copia de siguranță","⬆ استعادة النسخة الاحتياطية","⬆ Rikthe kopjen rezervë","⬆ Restore backup"],
  "Beim Wiederherstellen werden die bisherigen Stundenzettel-Daten auf diesem Gerät ersetzt.":["При восстановлении прежние данные табеля на этом устройстве будут заменены.","Під час відновлення попередні дані табеля на цьому пристрої буде замінено.","Geri yükleme sırasında bu cihazdaki mevcut çizelge verileri değiştirilir.","Przywrócenie zastąpi dotychczasowe dane ewidencji czasu na tym urządzeniu.","Restaurarea va înlocui datele existente de pontaj de pe acest dispozitiv.","عند الاستعادة سيتم استبدال بيانات سجل الدوام الحالية على هذا الجهاز.","Rikthimi do të zëvendësojë të dhënat ekzistuese të fletë-orarit në këtë pajisje.","Restoring replaces the existing timesheet data on this device."],
  "Die Sicherung enthält auch persönliche Adminangaben; bewahre die Datei vertraulich auf.":["Резервная копия содержит личные данные администратора; храните файл в безопасном месте.","Резервна копія містить особисті дані адміністратора; зберігайте файл конфіденційно.","Yedekleme kişisel yönetici bilgilerini de içerir; dosyayı gizli tutun.","Kopia zawiera także dane administratora; przechowuj ją w bezpiecznym miejscu.","Copia conține și date personale de administrator; păstrează fișierul confidențial.","تحتوي النسخة أيضًا على بيانات شخصية للمسؤول؛ احتفظ بالملف بسرية.","Kopja përmban edhe të dhëna personale të administratorit; ruaje skedarin në mënyrë konfidenciale.","The backup also contains personal admin details; keep the file private."],
  "Abbrechen":["Отмена","Скасувати","İptal","Anuluj","Anulează","إلغاء","Anulo","Cancel"],
  "Speichern":["Сохранить","Зберегти","Kaydet","Zapisz","Salvează","حفظ","Ruaj","Save"],
  "Bitte kurz prüfen":["Пожалуйста, проверьте","Будь ласка, перевірте","Lütfen kontrol edin","Proszę sprawdzić","Verifică, te rog","يرجى التحقق","Të lutem kontrollo","Please check"],
  "Trotzdem fortfahren":["Всё равно продолжить","Усе одно продовжити","Yine de devam et","Kontynuuj mimo to","Continuă oricum","المتابعة على أي حال","Vazhdo gjithsesi","Continue anyway"],
  "Zeit wählen":["Выбрать время","Вибрати час","Saat seçin","Wybierz godzinę","Alege ora","اختر الوقت","Zgjidh orën","Choose time"],
  "Stunde":["Час","Година","Saat","Godzina","Oră","ساعة","Orë","Hour"],
  "Minute":["Минута","Хвилина","Dakika","Minuta","Minut","دقيقة","Minutë","Minute"],
  "Übernehmen":["Применить","Застосувати","Uygula","Zastosuj","Aplică","تطبيق","Zbato","Apply"],
  "Projekt":["Проект","Проєкт","Proje","Projekt","Proiect","المشروع","Projekt","Project"],
  "Projekt auswählen oder eingeben":["Выберите или введите проект","Виберіть або введіть проєкт","Proje seçin veya girin","Wybierz lub wpisz projekt","Selectează sau introdu proiectul","اختر المشروع أو أدخله","Zgjidh ose shkruaj projektin","Select or enter project"],
  "Beginn":["Начало","Початок","Başlangıç","Początek","Început","البداية","Fillimi","Start"],
  "Ende":["Окончание","Завершення","Bitiş","Koniec","Sfârșit","النهاية","Mbarimi","End"],
  "Pause (Min)":["Перерыв (мин)","Перерва (хв)","Mola (dk)","Przerwa (min)","Pauză (min)","استراحة (دقيقة)","Pushim (min)","Break (min)"],
  "Für diesen Tag gibt es noch keine Buchung.":["За этот день записей пока нет.","За цей день ще немає записів.","Bu gün için henüz kayıt yok.","Brak wpisów dla tego dnia.","Nu există încă înregistrări pentru această zi.","لا توجد سجلات لهذا اليوم بعد.","Nuk ka ende regjistrime për këtë ditë.","There are no entries for this day yet."],
  "⧉ Buchungen vom Vortag kopieren":["⧉ Скопировать записи за предыдущий день","⧉ Скопіювати записи з попереднього дня","⧉ Önceki günün kayıtlarını kopyala","⧉ Kopiuj wpisy z poprzedniego dnia","⧉ Copiază pontajele din ziua anterioară","⧉ نسخ تسجيلات اليوم السابق","⧉ Kopjo regjistrimet e ditës së kaluar","⧉ Copy entries from previous day"],
  "Die Buchungen werden hinzugefügt. Vorhandene Einträge bleiben erhalten.":["Записи будут добавлены. Существующие записи сохранятся.","Записи буде додано. Наявні записи залишаться.","Kayıtlar eklenecek. Mevcut kayıtlar korunur.","Wpisy zostaną dodane. Istniejące pozostaną bez zmian.","Pontajele vor fi adăugate. Cele existente vor rămâne.","ستتم إضافة التسجيلات مع الاحتفاظ بالإدخالات الحالية.","Regjistrimet do të shtohen. Ato ekzistuese do të ruhen.","Entries will be added. Existing entries will be kept."],
  "＋ Buchung hinzufügen":["＋ Добавить запись","＋ Додати запис","＋ Kayıt ekle","＋ Dodaj wpis","＋ Adaugă pontaj","＋ إضافة تسجيل","＋ Shto regjistrim","＋ Add entry"],
  "Status":["Статус","Статус","Durum","Status","Status","الحالة","Statusi","Status"],
  "Arbeitstag":["Рабочий день","Робочий день","İş günü","Dzień pracy","Zi lucrătoare","يوم عمل","Ditë pune","Workday"],
  "Urlaub":["Отпуск","Відпустка","İzin","Urlop","Concediu","إجازة","Pushim","Vacation"],
  "Krankheit":["Болезнь","Хвороба","Hastalık","Choroba","Boală","مرض","Sëmundje","Sick"],
  "Feiertag":["Праздник","Свято","Resmî tatil","Święto","Sărbătoare legală","عطلة رسمية","Festë zyrtare","Public holiday"],
  "Unbezahlter Urlaub":["Отпуск без оплаты","Відпустка без збереження зарплати","Ücretsiz izin","Urlop bezpłatny","Concediu fără plată","إجازة غير مدفوعة","Pushim pa pagesë","Unpaid leave"],
  "Gespeichert ✓":["Сохранено ✓","Збережено ✓","Kaydedildi ✓","Zapisano ✓","Salvat ✓","تم الحفظ ✓","U ruajt ✓","Saved ✓"],
  "Monatsauswertung":["Итоги месяца","Підсумок місяця","Aylık özet","Podsumowanie miesiąca","Rezumatul lunii","ملخص الشهر","Përmbledhja mujore","Monthly summary"],
  "Erfasste Arbeitstage":["Учтённые рабочие дни","Зафіксовані робочі дні","Kaydedilen iş günleri","Zarejestrowane dni pracy","Zile lucrate înregistrate","أيام العمل المسجلة","Ditë pune të regjistruara","Recorded workdays"],
  "Arbeitszeit gesamt":["Общее рабочее время","Загальний робочий час","Toplam çalışma süresi","Łączny czas pracy","Timp total de lucru","إجمالي وقت العمل","Koha totale e punës","Total working time"],
  "Stunden je Projekt":["Часы по проектам","Години за проєктами","Projeye göre saatler","Godziny według projektu","Ore pe proiect","الساعات حسب المشروع","Orët sipas projektit","Hours by project"],
  "Für diesen Monat sind noch keine Projektstunden erfasst.":["За этот месяц проектные часы ещё не внесены.","За цей місяць ще не внесено годин за проєктами.","Bu ay için henüz proje saati kaydedilmedi.","Nie zarejestrowano jeszcze godzin projektowych w tym miesiącu.","Nu au fost încă înregistrate ore pe proiecte în această lună.","لم يتم تسجيل ساعات مشاريع لهذا الشهر بعد.","Nuk janë regjistruar ende orë projekti për këtë muaj.","No project hours have been recorded for this month yet."],
  "Prüfung":["Проверка","Перевірка","Kontrol","Kontrola","Verificare","المراجعة","Kontrolli","Check"],
  "Keine fehlenden Einträge, unvollständigen Buchungen oder Zeitüberschneidungen gefunden.":["Пропущенных записей, незавершённых бронирований или пересечений по времени не найдено.","Не знайдено пропущених записів, незавершених бронювань або перетинів часу.","Eksik kayıt, tamamlanmamış giriş veya çakışan saat bulunamadı.","Nie znaleziono brakujących wpisów, niekompletnych rezerwacji ani nakładających się godzin.","Nu au fost găsite înregistrări lipsă, pontaje incomplete sau suprapuneri de timp.","لم يتم العثور على إدخالات ناقصة أو تسجيلات غير مكتملة أو تداخلات زمنية.","Nuk u gjetën regjistrime që mungojnë, të paplota ose mbivendosje orari.","No missing entries, incomplete bookings, or overlapping times found."],
  "Gesamt":["Всего","Разом","Toplam","Razem","Total","الإجمالي","Gjithsej","Total"],
  "Monatssumme Arbeitsstunden":["Итого рабочих часов за месяц","Місячна сума робочих годин","Aylık çalışma saati toplamı","Miesięczna suma godzin pracy","Total lunar ore lucrate","مجموع ساعات العمل الشهرية","Gjithsej orë pune mujore","Monthly working hours"],
  "Monatssumme Urlaub":["Отпуск за месяц","Відпустка за місяць","Aylık izin","Urlop w miesiącu","Concediu lunar","إجازة الشهر","Pushime mujore","Monthly vacation"],
  "Monatssumme Krankheit":["Болезнь за месяц","Хвороба за місяць","Aylık hastalık","Choroba w miesiącu","Boală lunară","مرض الشهر","Sëmundje mujore","Monthly sick leave"],
  "Monatssumme Feiertag":["Праздники за месяц","Свята за місяць","Aylık tatil günleri","Święta w miesiącu","Sărbători lunare","عطلات الشهر","Festa mujore","Monthly public holidays"],
  "Monatssumme Unbezahlter Urlaub":["Отпуск без оплаты за месяц","Відпустка без оплати за місяць","Aylık ücretsiz izin","Urlop bezpłatny w miesiącu","Concediu fără plată lunar","إجازة غير مدفوعة للشهر","Pushim pa pagesë mujor","Monthly unpaid leave"],
  "Tag":["день","день","gün","dzień","zi","يوم","ditë","day"],
  "Tage":["дней","дні","gün","dni","zile","أيام","ditë","days"],
  "Std.":["ч","год","sa","godz.","ore","س","orë","hrs"],
  "Buchung": ["Запись","Запис","Kayıt","Wpis","Pontaj","تسجيل","Regjistrim","Entry"],
  "Arbeitstag ohne Buchung oder Abwesenheitsstatus.":["Рабочий день без записи или статуса отсутствия.","Робочий день без запису або статусу відсутності.","Kayıt veya devamsızlık durumu olmayan iş günü.","Dzień pracy bez wpisu lub statusu nieobecności.","Zi lucrătoare fără pontaj sau status de absență.","يوم عمل دون تسجيل أو حالة غياب.","Ditë pune pa regjistrim ose status mungese.","Workday without an entry or absence status."],
  "Stundenuebersicht":["Табель рабочего времени","Табель робочого часу","Çalışma saati özeti","Zestawienie czasu pracy","Situația orelor","ملخص ساعات العمل","Përmbledhja e orëve","Timesheet summary"],
  "Die Pause darf nicht länger als die Buchungszeit sein.":["Перерыв не может быть дольше времени записи.","Перерва не може бути довшою за час запису.","Mola süresi çalışma süresinden uzun olamaz.","Przerwa nie może być dłuższa niż czas wpisu.","Pauza nu poate fi mai lungă decât durata pontajului.","لا يمكن أن تكون الاستراحة أطول من مدة التسجيل.","Pushimi nuk mund të jetë më i gjatë se koha e regjistrimit.","The break cannot be longer than the booking duration."],
  "Endzeit darf nicht vor der Beginnzeit liegen.":["Время окончания не может быть раньше времени начала.","Час завершення не може бути раніше часу початку.","Bitiş saati başlangıç saatinden önce olamaz.","Godzina zakończenia nie może być wcześniejsza niż rozpoczęcia.","Ora de sfârșit nu poate fi înaintea orei de început.","لا يمكن أن يكون وقت الانتهاء قبل وقت البداية.","Ora e mbarimit nuk mund të jetë para orës së fillimit.","End time cannot be earlier than start time."],
  "Bitte zuerst die Empfänger-E-Mail im Adminbereich eintragen.":["Сначала укажите адрес получателя в настройках.","Спочатку вкажіть адресу одержувача в налаштуваннях.","Önce yönetim alanına alıcı e-postasını girin.","Najpierw wpisz adres e-mail odbiorcy w panelu.","Introdu mai întâi e-mailul destinatarului în administrare.","أدخل أولاً بريد المستلم في لوحة الإدارة.","Së pari vendos email-in e marrësit te administrimi.","Enter the recipient email in the admin area first."],
  "In Zwischenablage kopiert – jetzt in der Mail-App einfügen.":["Скопировано — вставьте в почтовое приложение.","Скопійовано — вставте в поштовий застосунок.","Panoya kopyalandı — şimdi e-posta uygulamasına yapıştırın.","Skopiowano — wklej teraz w aplikacji pocztowej.","Copiat — lipește acum în aplicația de e-mail.","تم النسخ — الصق الآن في تطبيق البريد.","U kopjua — ngjite tani në aplikacionin e emailit.","Copied — now paste it into your mail app."],
  "Kopieren nicht möglich – bitte Text manuell markieren.":["Не удалось скопировать — выделите текст вручную.","Не вдалося скопіювати — виділіть текст вручну.","Kopyalanamadı — lütfen metni elle seçin.","Nie można skopiować — zaznacz tekst ręcznie.","Copierea nu a reușit — selectează manual textul.","تعذر النسخ — يرجى تحديد النص يدويًا.","Nuk u kopjua — zgjidh tekstin manualisht.","Could not copy — please select the text manually."],
  "Dein Browser kann Dateien nicht direkt an die E-Mail übergeben. Die Excel-Datei wurde heruntergeladen; füge sie im E-Mail-Entwurf als Anhang hinzu.":["Браузер не может напрямую прикрепить файл к письму. Файл Excel скачан; прикрепите его к черновику письма.","Браузер не може безпосередньо передати файл до електронного листа. Файл Excel завантажено; додайте його до чернетки листа.","Tarayıcınız dosyayı doğrudan e-postaya ekleyemiyor. Excel dosyası indirildi; taslak e-postaya ekleyin.","Twoja przeglądarka nie może bezpośrednio dołączyć pliku do e-maila. Plik Excel został pobrany; dołącz go do wersji roboczej wiadomości.","Browserul nu poate atașa direct fișierul la e-mail. Fișierul Excel a fost descărcat; atașează-l la mesajul ciornă.","لا يمكن للمتصفح إرفاق الملف بالبريد الإلكتروني مباشرةً. تم تنزيل ملف Excel؛ أرفقه بمسودة الرسالة.","Shfletuesi nuk mund ta bashkëngjisë skedarin drejtpërdrejt në email. Skedari Excel u shkarkua; bashkëngjite te emaili në përgatitje.","Your browser cannot attach files to email directly. The Excel file was downloaded; attach it to the email draft."],
  "Abwesenheitsgrund":["Причина отсутствия","Причина відсутності","Devamsızlık nedeni","Powód nieobecności","Motivul absenței","سبب الغياب","Arsyeja e mungesës","Absence reason"],
  "Pause (Min)": ["Перерыв (мин)","Перерва (хв)","Mola (dk)","Przerwa (min)","Pauză (min)","استراحة (دقيقة)","Pushim (min)","Break (min)"],
  "Tag": ["День","День","Gün","Dzień","Zi","اليوم","Dita","Day"],
  "Datum": ["Дата","Дата","Tarih","Data","Data","التاريخ","Data","Date"],
  "Gesamt (Std)": ["Всего (ч)","Разом (год)","Toplam (sa)","Razem (godz.)","Total (ore)","الإجمالي (س)","Gjithsej (orë)","Total (hrs)"],
  "Beginn oder Ende fehlt noch.":["Не указано время начала или окончания.","Ще не вказано початок або завершення.","Başlangıç veya bitiş saati eksik.","Brakuje godziny rozpoczęcia lub zakończenia.","Lipsește ora de început sau de sfârșit.","وقت البداية أو النهاية غير موجود.","Mungon ora e fillimit ose mbarimit.","Start or end time is missing."],
  "Projekt fehlt noch.":["Не указан проект.","Не вказано проєкт.","Proje eksik.","Brakuje projektu.","Lipsește proiectul.","المشروع غير محدد.","Mungon projekti.","Project is missing."],
  "Buchungen überschneiden sich zeitlich.":["Время записей пересекается.","Час записів перетинається.","Kayıt saatleri çakışıyor.","Wpisy nakładają się w czasie.","Pontajele se suprapun.","تتداخل أوقات التسجيلات.","Orari i regjistrimeve mbivendoset.","Bookings overlap in time."],
  "Urlaub": ["Отпуск","Відпустка","İzin","Urlop","Concediu","إجازة","Pushim","Vacation"],
  "Krankheit": ["Болезнь","Хвороба","Hastalık","Choroba","Boală","مرض","Sëmundje","Sick leave"],
  "Feiertag": ["Праздник","Свято","Resmî tatil","Święto","Sărbătoare legală","عطلة رسمية","Festë zyrtare","Public holiday"],
  "Unbezahlter Urlaub": ["Отпуск без оплаты","Відпустка без оплати","Ücretsiz izin","Urlop bezpłatny","Concediu fără plată","إجازة غير مدفوعة","Pushim pa pagesë","Unpaid leave"],
  "Gespeichert":["Сохранено","Збережено","Kaydedildi","Zapisano","Salvat","تم الحفظ","U ruajt","Saved"],
  "unbekannter Fehler":["неизвестная ошибка","невідома помилка","bilinmeyen hata","nieznany błąd","eroare necunoscută","خطأ غير معروف","gabim i panjohur","unknown error"],
  "Datensicherung wurde heruntergeladen.":["Резервная копия скачана.","Резервну копію завантажено.","Yedekleme indirildi.","Kopia zapasowa została pobrana.","Copia de siguranță a fost descărcată.","تم تنزيل النسخة الاحتياطية.","Kopja rezervë u shkarkua.","Backup downloaded."],
  "Die Datei ist keine unterstützte Stundenzettel-Sicherung.":["Этот файл не является поддерживаемой резервной копией табеля.","Цей файл не є підтримуваною резервною копією табеля.","Bu dosya desteklenen bir çalışma çizelgesi yedeği değil.","Ten plik nie jest obsługiwaną kopią zapasową ewidencji czasu.","Acest fișier nu este o copie de siguranță compatibilă a pontajului.","هذا الملف ليس نسخة احتياطية مدعومة لسجل الدوام.","Ky skedar nuk është kopje rezervë e mbështetur e fletë-orarit.","This file is not a supported timesheet backup."],
  "Die Sicherung enthält ein ungültiges Datum.":["В резервной копии указана неверная дата.","У резервній копії вказано неправильну дату.","Yedeklemede geçersiz bir tarih var.","Kopia zawiera nieprawidłową datę.","Copia conține o dată nevalidă.","تحتوي النسخة الاحتياطية على تاريخ غير صالح.","Kopja rezervë përmban një datë të pavlefshme.","The backup contains an invalid date."],
  "Die Sicherung enthält einen ungültigen Tageseintrag.":["В резервной копии есть неверная запись за день.","Резервна копія містить неправильний запис за день.","Yedekleme geçersiz bir günlük kayıt içeriyor.","Kopia zawiera nieprawidłowy wpis dzienny.","Copia conține o înregistrare zilnică nevalidă.","تحتوي النسخة الاحتياطية على سجل يومي غير صالح.","Kopja rezervë përmban një regjistrim ditor të pavlefshëm.","The backup contains an invalid daily entry."],
  "Datensicherung wurde wiederhergestellt.":["Резервная копия восстановлена.","Резервну копію відновлено.","Yedekleme geri yüklendi.","Kopia zapasowa została przywrócona.","Copia de siguranță a fost restaurată.","تمت استعادة النسخة الاحتياطية.","Kopja rezervë u rikthye.","Backup restored."],
  "Die Sicherung konnte nicht gelesen werden.":["Не удалось прочитать резервную копию.","Не вдалося прочитати резервну копію.","Yedekleme okunamadı.","Nie można odczytać kopii zapasowej.","Copia de siguranță nu a putut fi citită.","تعذرت قراءة النسخة الاحتياطية.","Kopja rezervë nuk mund të lexohej.","The backup could not be read."],
  "Für diesen Monat wurden noch keine Stunden erfasst. Trotzdem fortfahren?":["За этот месяц ещё не внесены часы. Всё равно продолжить?","За цей місяць ще не внесено годин. Усе одно продовжити?","Bu ay için henüz saat girilmedi. Yine de devam edilsin mi?","Nie wpisano jeszcze godzin za ten miesiąc. Kontynuować mimo to?","Nu au fost încă înregistrate ore pentru această lună. Continui oricum?","لم يتم تسجيل ساعات لهذا الشهر بعد. هل تريد المتابعة؟","Nuk janë regjistruar ende orë për këtë muaj. Të vazhdohet gjithsesi?","No hours have been entered for this month yet. Continue anyway?"],
  "Es gibt noch offene Punkte für diesen Monat:":["За этот месяц остались вопросы для проверки:","За цей місяць залишилися невирішені питання:","Bu ay için kontrol edilmesi gereken konular var:","Pozostały kwestie do sprawdzenia w tym miesiącu:","Există elemente de verificat pentru această lună:","هناك نقاط لمراجعتها لهذا الشهر:","Ka ende çështje për t'u kontrolluar këtë muaj:","There are items to review for this month:"],
  "Excel-Datei konnte nicht erstellt werden. Bitte Internetverbindung prüfen und erneut versuchen.":["Не удалось создать файл Excel. Проверьте подключение к интернету и повторите попытку.","Не вдалося створити файл Excel. Перевірте з’єднання з інтернетом і спробуйте ще раз.","Excel dosyası oluşturulamadı. İnternet bağlantınızı kontrol edip tekrar deneyin.","Nie udało się utworzyć pliku Excel. Sprawdź połączenie z internetem i spróbuj ponownie.","Fișierul Excel nu a putut fi creat. Verifică conexiunea la internet și încearcă din nou.","تعذر إنشاء ملف Excel. تحقق من اتصال الإنترنت وحاول مرة أخرى.","Skedari Excel nuk u krijua. Kontrollo lidhjen me internetin dhe provo përsëri.","The Excel file could not be created. Check your internet connection and try again."],
  "Excel-Bibliothek konnte nicht geladen werden (Internetverbindung prüfen) – bitte erneut versuchen.":["Не удалось загрузить библиотеку Excel (проверьте подключение к интернету) — повторите попытку.","Не вдалося завантажити бібліотеку Excel (перевірте з’єднання з інтернетом) — спробуйте ще раз.","Excel kitaplığı yüklenemedi (internet bağlantısını kontrol edin) — lütfen tekrar deneyin.","Nie można załadować biblioteki Excel (sprawdź połączenie z internetem) — spróbuj ponownie.","Biblioteca Excel nu a putut fi încărcată (verifică internetul) — încearcă din nou.","تعذر تحميل مكتبة Excel (تحقق من اتصال الإنترنت) — يرجى المحاولة مرة أخرى.","Biblioteka Excel nuk u ngarkua (kontrollo internetin) — provo përsëri.","The Excel library could not be loaded (check your internet connection) — please try again."],
  "Kopieren nicht möglich – bitte Text manuell markieren.":["Не удалось скопировать — выделите текст вручную.","Не вдалося скопіювати — виділіть текст вручну.","Kopyalanamadı — lütfen metni elle seçin.","Nie można skopiować — zaznacz tekst ręcznie.","Copierea nu a reușit — selectează manual textul.","تعذر النسخ — يرجى تحديد النص يدويًا.","Nuk u kopjua — zgjidh tekstin manualisht.","Could not copy — please select the text manually."]
};

const APP_SLOVENIAN_TRANSLATIONS = {
  "Sprache wählen":"Izberite jezik","Stundenzettel":"Evidenca delovnega časa",
  "Mo":"Pon","Di":"Tor","Mi":"Sre","Do":"Čet","Fr":"Pet","Sa":"Sob","So":"Ned",
  "Menü":"Meni","Vorheriger Monat":"Prejšnji mesec","Nächster Monat":"Naslednji mesec","Monatssumme":"Skupaj za mesec",
  "📎 Per E-Mail senden (mit Excel)":"📎 Pošlji po e-pošti (z Excelom)","⧉ E-Mail-Text kopieren (falls sich keine Mail-App öffnet)":"⧉ Kopiraj besedilo e-pošte (če se poštna aplikacija ne odpre)","📎 Excel-Datei herunterladen":"📎 Prenesi datoteko Excel",
  "📖 Benutzeranleitung":"📖 Navodila za uporabnike","👤 Adminbereich":"👤 Skrbniški razdelek","Adminbereich":"Skrbniški razdelek",
  "Vorname":"Ime","Name":"Priimek","Personalnummer":"Številka zaposlenega","E-Mail Empfänger (Arbeitgeber)":"E-poštni naslov prejemnika (delodajalec)",
  "Zeiteingabe":"Vnos časa","Ziffernblatt (bisher)":"Številčnica (trenutna)","24‑Stunden-Rad (Stunden und Minuten)":"24-urno kolesce (ure in minute)",
  "Übliche Arbeitstage (optional)":"Običajni delovni dnevi (neobvezno)","Vergangene ausgewählte Arbeitstage ohne Buchung oder Abwesenheitsstatus werden in der Monatsprüfung angezeigt.":"Pretekli izbrani delovni dnevi brez vnosa ali statusa odsotnosti bodo prikazani pri mesečnem pregledu.",
  "Meine Projekte (je eine Zeile)":"Moji projekti (vsak v svoji vrstici)","Gespeicherte und bereits verwendete Projekte erscheinen als Vorschläge.":"Shranjeni in že uporabljeni projekti bodo prikazani kot predlogi.",
  "⬇ Datensicherung herunterladen":"⬇ Prenesi varnostno kopijo","⬆ Datensicherung wiederherstellen":"⬆ Obnovi varnostno kopijo",
  "Beim Wiederherstellen werden die bisherigen Stundenzettel-Daten auf diesem Gerät ersetzt.":"Obnovitev bo nadomestila obstoječe podatke evidence delovnega časa v tej napravi.","Die Sicherung enthält auch persönliche Adminangaben; bewahre die Datei vertraulich auf.":"Varnostna kopija vsebuje tudi osebne podatke skrbnika; datoteko hranite zaupno.",
  "Abbrechen":"Prekliči","Speichern":"Shrani","Bitte kurz prüfen":"Prosimo, na hitro preverite","Trotzdem fortfahren":"Vseeno nadaljuj","Zeit wählen":"Izberite čas","Stunde":"Ura","Minute":"Minuta","Übernehmen":"Potrdi",
  "Projekt":"Projekt","Projekt auswählen oder eingeben":"Izberite ali vnesite projekt","Beginn":"Začetek","Ende":"Konec","Pause (Min)":"Odmor (min)",
  "Für diesen Tag gibt es noch keine Buchung.":"Za ta dan še ni vnosov.","⧉ Buchungen vom Vortag kopieren":"⧉ Kopiraj vnose iz prejšnjega dne","Die Buchungen werden hinzugefügt. Vorhandene Einträge bleiben erhalten.":"Vnosi bodo dodani. Obstoječi vnosi bodo ohranjeni.","＋ Buchung hinzufügen":"＋ Dodaj vnos",
  "Status":"Status","Arbeitstag":"Delovni dan","Urlaub":"Dopust","Krankheit":"Bolniška odsotnost","Feiertag":"Praznik","Unbezahlter Urlaub":"Neplačan dopust","Gespeichert ✓":"Shranjeno ✓","Gespeichert":"Shranjeno",
  "Monatsauswertung":"Mesečni pregled","Erfasste Arbeitstage":"Zabeleženi delovni dnevi","Arbeitszeit gesamt":"Skupni delovni čas","Stunden je Projekt":"Ure po projektih","Für diesen Monat sind noch keine Projektstunden erfasst.":"Za ta mesec še ni zabeleženih ur po projektih.","Prüfung":"Pregled",
  "Keine fehlenden Einträge, unvollständigen Buchungen oder Zeitüberschneidungen gefunden.":"Ni manjkajočih ali nepopolnih vnosov oziroma časovnih prekrivanj.","Gesamt":"Skupaj","Monatssumme Arbeitsstunden":"Skupno število delovnih ur v mesecu","Monatssumme Urlaub":"Dopust v mesecu","Monatssumme Krankheit":"Bolniška odsotnost v mesecu","Monatssumme Feiertag":"Prazniki v mesecu","Monatssumme Unbezahlter Urlaub":"Neplačan dopust v mesecu","Tag":"Dan","Tage":"Dni","Std.":"ur","Buchung":"Vnos",
  "Arbeitstag ohne Buchung oder Abwesenheitsstatus.":"Delovni dan brez vnosa ali statusa odsotnosti.","Stundenuebersicht":"Pregled delovnih ur","Die Pause darf nicht länger als die Buchungszeit sein.":"Odmor ne sme biti daljši od trajanja vnosa.","Endzeit darf nicht vor der Beginnzeit liegen.":"Čas konca ne sme biti pred časom začetka.",
  "Bitte zuerst die Empfänger-E-Mail im Adminbereich eintragen.":"Najprej v skrbniškem razdelku vnesite e-poštni naslov prejemnika.","In Zwischenablage kopiert – jetzt in der Mail-App einfügen.":"Kopirano v odložišče – zdaj prilepite v poštno aplikacijo.","Kopieren nicht möglich – bitte Text manuell markieren.":"Kopiranje ni mogoče – besedilo označite ročno.",
  "Dein Browser kann Dateien nicht direkt an die E-Mail übergeben. Die Excel-Datei wurde heruntergeladen; füge sie im E-Mail-Entwurf als Anhang hinzu.":"Brskalnik datoteke ne more neposredno priložiti e-pošti. Datoteka Excel je prenesena; priložite jo osnutku e-pošte.",
  "Abwesenheitsgrund":"Razlog odsotnosti","Datum":"Datum","Gesamt (Std)":"Skupaj (ur)","Beginn oder Ende fehlt noch.":"Manjka čas začetka ali konca.","Projekt fehlt noch.":"Manjka projekt.","Buchungen überschneiden sich zeitlich.":"Časi vnosov se prekrivajo.",
  "unbekannter Fehler":"neznana napaka","Datensicherung wurde heruntergeladen.":"Varnostna kopija je prenesena.","Die Datei ist keine unterstützte Stundenzettel-Sicherung.":"Ta datoteka ni podprta varnostna kopija evidence delovnega časa.","Die Sicherung enthält ein ungültiges Datum.":"Varnostna kopija vsebuje neveljaven datum.","Die Sicherung enthält einen ungültigen Tageseintrag.":"Varnostna kopija vsebuje neveljaven dnevni vnos.","Datensicherung wurde wiederhergestellt.":"Varnostna kopija je obnovljena.","Die Sicherung konnte nicht gelesen werden.":"Varnostne kopije ni bilo mogoče prebrati.",
  "Für diesen Monat wurden noch keine Stunden erfasst. Trotzdem fortfahren?":"Za ta mesec še ni zabeleženih ur. Vseeno nadaljujem?","Es gibt noch offene Punkte für diesen Monat:":"Za ta mesec je treba preveriti še nekaj stvari:",
  "Excel-Datei konnte nicht erstellt werden. Bitte Internetverbindung prüfen und erneut versuchen.":"Datoteke Excel ni bilo mogoče ustvariti. Preverite internetno povezavo in poskusite znova.","Excel-Bibliothek konnte nicht geladen werden (Internetverbindung prüfen) – bitte erneut versuchen.":"Knjižnice Excel ni bilo mogoče naložiti (preverite internetno povezavo) – poskusite znova."
};

const APP_TRANSLATION_MAP = Object.fromEntries(Object.entries(APP_TRANSLATIONS).map(([source,values])=>[source,APP_LANGUAGE==="de"?source:APP_LANGUAGE==="sl"?(APP_SLOVENIAN_TRANSLATIONS[source]||source):values[APP_LANGUAGE_OPTIONS.indexOf(APP_LANGUAGE)-1]]));
const APP_ORIGINAL_TEXT = new WeakMap();
const APP_ORIGINAL_ATTRS = new WeakMap();
function translateAppText(value){
  const normalized=String(value).replace(/\s+/g," ").trim();
  if(APP_TRANSLATION_MAP[normalized]) return APP_TRANSLATION_MAP[normalized];
  let match=normalized.match(/^Es werden (\d+) Buchung(?:en)? zu diesem Tag hinzugefügt\. Vorhandene Buchungen bleiben erhalten\. Fortfahren\?$/);
  if(match){
    const prompts={de:`Es werden ${match[1]} Buchung${match[1]==="1"?"":"en"} zu diesem Tag hinzugefügt. Vorhandene Buchungen bleiben erhalten. Fortfahren?`,ru:`К этому дню будет добавлено записей: ${match[1]}. Существующие записи сохранятся. Продолжить?`,uk:`До цього дня буде додано записів: ${match[1]}. Наявні записи залишаться. Продовжити?`,tr:`Bu güne ${match[1]} kayıt eklenecek. Mevcut kayıtlar korunacak. Devam edilsin mi?`,pl:`Do tego dnia zostanie dodanych ${match[1]} wpisów. Istniejące wpisy pozostaną. Kontynuować?`,ro:`Se vor adăuga ${match[1]} pontaje pentru această zi. Cele existente vor rămâne. Continui?`,ar:`ستتم إضافة ${match[1]} تسجيلات لهذا اليوم. ستبقى التسجيلات الحالية. هل تريد المتابعة؟`,sq:`Do të shtohen ${match[1]} regjistrime për këtë ditë. Regjistrimet ekzistuese do të ruhen. Të vazhdohet?`,en:`${match[1]} entries will be added to this day. Existing entries will be kept. Continue?`,sl:`Za ta dan bo dodanih ${match[1]} vnosov. Obstoječi vnosi bodo ohranjeni. Nadaljujem?`};
    return prompts[APP_LANGUAGE];
  }
  match=normalized.match(/^Diese Sicherung enthält (\d+) Tage\. Alle vorhandenen Stundenzettel-Daten auf diesem Gerät werden ersetzt\. Fortfahren\?$/);
  if(match){
    const prompts={de:`Diese Sicherung enthält ${match[1]} Tage. Alle vorhandenen Stundenzettel-Daten auf diesem Gerät werden ersetzt. Fortfahren?`,ru:`Резервная копия содержит дней: ${match[1]}. Все текущие данные табеля на этом устройстве будут заменены. Продолжить?`,uk:`Резервна копія містить днів: ${match[1]}. Усі наявні дані табеля на цьому пристрої буде замінено. Продовжити?`,tr:`Bu yedek ${match[1]} gün içeriyor. Bu cihazdaki mevcut tüm çizelge verileri değiştirilecek. Devam edilsin mi?`,pl:`Kopia zawiera dni: ${match[1]}. Wszystkie obecne dane ewidencji czasu na tym urządzeniu zostaną zastąpione. Kontynuować?`,ro:`Această copie conține ${match[1]} zile. Toate datele existente de pontaj de pe acest dispozitiv vor fi înlocuite. Continui?`,ar:`تحتوي هذه النسخة على ${match[1]} يومًا. سيتم استبدال جميع بيانات سجل الدوام الحالية على هذا الجهاز. هل تريد المتابعة؟`,sq:`Kjo kopje përmban ${match[1]} ditë. Të gjitha të dhënat ekzistuese të fletë-orarit në këtë pajisje do të zëvendësohen. Të vazhdohet?`,en:`This backup contains ${match[1]} days. All existing timesheet data on this device will be replaced. Continue?`,sl:`Varnostna kopija vsebuje ${match[1]} dni. Vsi obstoječi podatki evidence delovnega časa v tej napravi bodo zamenjani. Nadaljujem?`};
    return prompts[APP_LANGUAGE];
  }
  match=normalized.match(/^(.+), Buchung (\d+): (.+)$/);
  if(match){
    const entryWord={de:"Buchung",ru:"запись",uk:"запис",tr:"kayıt",pl:"wpis",ro:"pontaj",ar:"تسجيل",sq:"regjistrim",en:"entry",sl:"vnos"}[APP_LANGUAGE];
    return `${match[1]}, ${entryWord} ${match[2]}: ${translateAppText(match[3])}`;
  }
  match=normalized.match(/^(.+): Arbeitsbuchungen sind vorhanden, obwohl der Tag als „(.+)“ markiert ist\.$/);
  if(match){
    const tails={de:`Arbeitsbuchungen sind vorhanden, obwohl der Tag als „${match[2]}“ markiert ist.`,ru:`есть рабочие записи, хотя день отмечен как «${match[2]}».`,uk:`є робочі записи, хоча день позначено як «${match[2]}».`,tr:`gün "${match[2]}" olarak işaretlenmiş olmasına rağmen çalışma kayıtları var.`,pl:`istnieją wpisy pracy, mimo że dzień oznaczono jako „${match[2]}”.`,ro:`există pontaje de lucru, deși ziua este marcată „${match[2]}”.`,ar:`توجد تسجيلات عمل رغم أن اليوم محدد كـ «${match[2]}».`,sq:`ka regjistrime pune edhe pse dita është shënuar si "${match[2]}".`,en:`work entries exist although the day is marked as “${match[2]}”.`,sl:`obstajajo delovni vnosi, čeprav je dan označen kot »${match[2]}«.`};
    return `${match[1]}: ${tails[APP_LANGUAGE]}`;
  }
  match=normalized.match(/^(.+): üblicher Arbeitstag ohne Buchung oder Abwesenheitsstatus\.$/);
  if(match){
    const tails={de:"üblicher Arbeitstag ohne Buchung oder Abwesenheitsstatus.",ru:"обычный рабочий день без записи или статуса отсутствия.",uk:"звичайний робочий день без запису або статусу відсутності.",tr:"kayıt veya devamsızlık durumu olmayan normal iş günü.",pl:"zwykły dzień pracy bez wpisu lub statusu nieobecności.",ro:"zi obișnuită de lucru fără pontaj sau status de absență.",ar:"يوم عمل معتاد دون تسجيل أو حالة غياب.",sq:"ditë e zakonshme pune pa regjistrim ose status mungese.",en:"usual workday without an entry or absence status.",sl:"običajen delovni dan brez vnosa ali statusa odsotnosti."};
    return `${match[1]}: ${tails[APP_LANGUAGE]}`;
  }
  match=normalized.match(/^(.+): Buchungen überschneiden sich zeitlich\.$/);
  if(match){
    const tails={de:"Buchungen überschneiden sich zeitlich.",ru:"время записей пересекается.",uk:"час записів перетинається.",tr:"kayıt saatleri çakışıyor.",pl:"wpisy nakładają się w czasie.",ro:"pontajele se suprapun în timp.",ar:"تتداخل أوقات التسجيلات.",sq:"orari i regjistrimeve mbivendoset.",en:"bookings overlap in time.",sl:"časovni vnosi se prekrivajo."};
    return `${match[1]}: ${tails[APP_LANGUAGE]}`;
  }
  match=normalized.match(/^(.+), (\d{1,2})\.(\d{1,2})\.: mehr als 12 Arbeitsstunden\.$/);
  if(match){
    const tails={de:"mehr als 12 Arbeitsstunden.",ru:"более 12 рабочих часов.",uk:"понад 12 робочих годин.",tr:"12 saatten fazla çalışma.",pl:"ponad 12 godzin pracy.",ro:"peste 12 ore de lucru.",ar:"أكثر من 12 ساعة عمل.",sq:"më shumë se 12 orë pune.",en:"more than 12 working hours.",sl:"več kot 12 delovnih ur."};
    return `${match[1]}, ${match[2]}.${match[3]}.: ${tails[APP_LANGUAGE]}`;
  }
  match=normalized.match(/^Speichern fehlgeschlagen: (.+)$/);
  if(match){
    const prefixes={de:"Speichern fehlgeschlagen: ",ru:"Не удалось сохранить: ",uk:"Не вдалося зберегти: ",tr:"Kaydedilemedi: ",pl:"Nie udało się zapisać: ",ro:"Salvarea a eșuat: ",ar:"فشل الحفظ: ",sq:"Ruajtja dështoi: ",en:"Saving failed: ",sl:"Shranjevanje ni uspelo: "};
    return prefixes[APP_LANGUAGE]+translateAppText(match[1]);
  }
  const unitMatch=normalized.match(/^(.+) Std\.$/);
  if(unitMatch){
    const units={de:"Std.",ru:"ч",uk:"год",tr:"sa",pl:"godz.",ro:"ore",ar:"س",sq:"orë",en:"hrs",sl:"ur"};
    return `${unitMatch[1]} ${units[APP_LANGUAGE]}`;
  }
  const warningCount=normalized.match(/^(\d+) offene oder auffällige Angaben?$/);
  if(warningCount){
    const captions={de:"offene oder auffällige Angaben",ru:"незавершённых или требующих внимания пунктов",uk:"відкритих або проблемних пунктів",tr:"açık veya dikkat gerektiren konu",pl:"otwartych lub wymagających uwagi pozycji",ro:"elemente deschise sau care necesită atenție",ar:"عناصر مفتوحة أو تحتاج إلى مراجعة",sq:"çështje të hapura ose që kërkojnë vëmendje",en:"open or flagged item",sl:"odprtih ali opozorilnih postavk"};
    return `${warningCount[1]} ${captions[APP_LANGUAGE]}`;
  }
  const extraCount=normalized.match(/^und (\d+) weitere …$/);
  if(extraCount){
    const captions={de:`und ${extraCount[1]} weitere …`,ru:`и ещё ${extraCount[1]} …`,uk:`і ще ${extraCount[1]} …`,tr:`ve ${extraCount[1]} tane daha …`,pl:`i jeszcze ${extraCount[1]} …`,ro:`și încă ${extraCount[1]} …`,ar:`و ${extraCount[1]} أخرى …`,sq:`dhe ${extraCount[1]} të tjera …`,en:`and ${extraCount[1]} more …`,sl:`in še ${extraCount[1]} …`};
    return captions[APP_LANGUAGE];
  }
  const summaryHeading=normalized.match(/^Monatsauswertung · (.+)$/);
  if(summaryHeading){
    const captions={de:"Monatsauswertung",ru:"Итоги месяца",uk:"Підсумок місяця",tr:"Aylık özet",pl:"Podsumowanie miesiąca",ro:"Rezumatul lunii",ar:"ملخص الشهر",sq:"Përmbledhja mujore",en:"Monthly summary",sl:"Mesečni pregled"};
    return `${captions[APP_LANGUAGE]} · ${summaryHeading[1]}`;
  }
  const downloadedFile=normalized.match(/^Datei "(.+)" heruntergeladen – jetzt in deiner Mail-App als Anhang auswählen\.$/);
  if(downloadedFile){
    const messages={de:`Datei "${downloadedFile[1]}" heruntergeladen – jetzt in deiner Mail-App als Anhang auswählen.`,ru:`Файл "${downloadedFile[1]}" скачан — теперь выберите его как вложение в почтовом приложении.`,uk:`Файл "${downloadedFile[1]}" завантажено — тепер виберіть його як вкладення у поштовому застосунку.`,tr:`"${downloadedFile[1]}" dosyası indirildi — şimdi e-posta uygulamanızda ek olarak seçin.`,pl:`Plik "${downloadedFile[1]}" został pobrany — wybierz go teraz jako załącznik w aplikacji pocztowej.`,ro:`Fișierul "${downloadedFile[1]}" a fost descărcat — selectează-l ca atașament în aplicația de e-mail.`,ar:`تم تنزيل الملف "${downloadedFile[1]}" — اختره الآن كمرفق في تطبيق البريد الإلكتروني.`,sq:`Skedari "${downloadedFile[1]}" u shkarkua — zgjidhe tani si bashkëngjitje në aplikacionin e emailit.`,en:`File "${downloadedFile[1]}" downloaded — now select it as an attachment in your mail app.`,sl:`Datoteka "${downloadedFile[1]}" je prenesena – zdaj jo izberite kot priponko v poštni aplikaciji.`};
    return messages[APP_LANGUAGE];
  }
  const pickerLabel=normalized.match(/^(Beginn|Ende) wählen$/);
  if(pickerLabel){
    const captions={de:"wählen",ru:"выбрать",uk:"вибрати",tr:"seçin",pl:"wybierz",ro:"alege",ar:"اختر",sq:"zgjidh",en:"choose",sl:"izberite"};
    const subject=translateAppText(pickerLabel[1]);
    return `${subject} ${captions[APP_LANGUAGE]}`;
  }
  match=normalized.match(/^Buchung (\d+)( entfernen)?$/);
  if(match){
    const labels={de:["Buchung","entfernen"],ru:["Запись","удалить"],uk:["Запис","видалити"],tr:["Kayıt","kaldır"],pl:["Wpis","usuń"],ro:["Pontaj","elimină"],ar:["تسجيل","إزالة"],sq:["Regjistrim","hiq"],en:["Entry","remove"],sl:["Vnos","odstrani"]}[APP_LANGUAGE];
    return `${labels[0]} ${match[1]}${match[2]?` ${labels[1]}`:""}`;
  }
  match=normalized.match(/^Buchung (\d+) überschneidet sich zeitlich mit einer anderen Buchung\.$/);
  if(match){
    const texts={de:`Buchung ${match[1]} überschneidet sich zeitlich mit einer anderen Buchung.`,ru:`Запись ${match[1]} пересекается по времени с другой записью.`,uk:`Запис ${match[1]} перетинається в часі з іншим записом.`,tr:`${match[1]}. kayıt başka bir kayıtla saat bakımından çakışıyor.`,pl:`Wpis ${match[1]} nakłada się w czasie na inny wpis.`,ro:`Pontajul ${match[1]} se suprapune în timp cu un alt pontaj.`,ar:`يتداخل التسجيل ${match[1]} زمنياً مع تسجيل آخر.`,sq:`Regjistrimi ${match[1]} mbivendoset në kohë me një regjistrim tjetër.`,en:`Entry ${match[1]} overlaps another entry in time.`,sl:`Vnos ${match[1]} se časovno prekriva z drugim vnosom.`};
    return texts[APP_LANGUAGE];
  }
  return value;
}
function applyAppLanguage(root=document.body){
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  let node;
  while((node=walker.nextNode())){
    if(!node.nodeValue.trim()) continue;
    if(!APP_ORIGINAL_TEXT.has(node)) APP_ORIGINAL_TEXT.set(node,node.nodeValue);
    const original=APP_ORIGINAL_TEXT.get(node);
    const translated=translateAppText(original);
    if(node.nodeValue!==translated) node.nodeValue=translated;
  }
  root.querySelectorAll?.("[aria-label],[title],[placeholder]").forEach(el=>{
    if(!APP_ORIGINAL_ATTRS.has(el)) APP_ORIGINAL_ATTRS.set(el,{"aria-label":el.getAttribute("aria-label"),title:el.getAttribute("title"),placeholder:el.getAttribute("placeholder")});
    const attrs=APP_ORIGINAL_ATTRS.get(el);
    for(const name of Object.keys(attrs)) if(attrs[name]!==null){const translated=translateAppText(attrs[name]);if(el.getAttribute(name)!==translated)el.setAttribute(name,translated);}
  });
}
function initializeAppLanguage(){
  const root=document.documentElement;
  root.lang=APP_LANGUAGE;
  root.dir=APP_LANGUAGE==="ar"?"rtl":"ltr";
  document.title=translateAppText(document.title);
  const selector=document.getElementById("languageSelect");
  if(selector){
    selector.value=APP_LANGUAGE;
    selector.addEventListener("change",()=>{
      try { localStorage.setItem("stundenzettel_sprache",selector.value); } catch(e){}
      location.reload();
    });
  }
  applyAppLanguage();
  const observer=new MutationObserver(records=>{
    for(const record of records){
      if(record.type==="characterData") applyAppLanguage(record.target.parentElement||document.body);
      else for(const node of record.addedNodes){
        if(node.nodeType===Node.ELEMENT_NODE) applyAppLanguage(node);
        else if(node.nodeType===Node.TEXT_NODE&&node.parentElement) applyAppLanguage(node.parentElement);
      }
    }
  });
  observer.observe(document.body,{childList:true,subtree:true,characterData:true});
}
