// ==UserScript==
// @name         stats from Moodle
// @namespace    http://tampermonkey.net/
// @version      2025-01-30
// @description  Проверяет, какие курсы были загружены в Moodle
// @author       Zaikov
// @match        https://tulsu.ru/moodle_dot/course/index.php?categoryid=678*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tampermonkey.net
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
async function chk_cource(result, url) {
  var course_name;
  var pps;
  var double_pps;
  var loaded;
  var denied_text;
  const art = document.createElement('article');
  const id = Date.now();
  art.setAttribute('id', id);
  art.style.display = 'none';
  document.body.appendChild(art);
  fetch(url, { signal: AbortSignal.timeout(10000) })
    .then(response => response.text())
    .then(html => {
      // Do something with the HTML code
      art.innerHTML = html;
      // Название дисциплины
      course_name = art.getElementsByClassName('page-header-headings')[0]
        .textContent;
      // ФИО ППС
      pps = art
        .getElementsByClassName('teachers')[0]
        .textContent.split('Учитель: ')
        .slice(1)
        .join();
            double_pps = Array.from(
        art.getElementsByClassName('name'),
        x => x.textContent
      ).join();
      //console.log(double_pps);
      // загружены материалы?
      if (art.getElementsByClassName('activityinstance').length > 1) {
        loaded = 'Да';
      } else {
        loaded = 'НЕТ';
      }
      const denied = art.getElementsByClassName('box py-3 generalbox');
      if (!(denied === null)) {
        if (denied.length === 2) {
          denied_text = denied[1].textContent;
        } else {
          denied_text = '';
        }
      }
      let newRow = result.insertRow();
      for (const the_text of [
	result.rows.length-1,
        course_name,
        pps,
        double_pps,
        loaded,
        denied_text,
      ]) {
        let newCell = newRow.insertCell();
        newCell.innerText = the_text;
      }
      document.getElementById(id).remove();
    })
    .catch(error => {console.error(' Курс ', url, 'не загружен:', error);
      let newRow = result.insertRow();
      var newCell = newRow.insertCell();
      newCell.innerText = result.rows.length-1;
      newCell = newRow.insertCell();
      newCell.innerText = ' Курс '+url+' не загружен: '+error;
});
}

async function load_page(url, result) {
  const art = document.createElement('div');
  const id = `Z-div-code-${url.slice(-1)}`;
  art.setAttribute('id', id);
  art.style.display = 'none';
  document.body.appendChild(art);
  fetch(url)
    .then(response => response.text())
    .then(html => {
      // Do something with the HTML code
      art.innerHTML = html;
      for (const defaultElement of art.getElementsByClassName('coursebox')) {
        chk_cource(
          result,
          defaultElement.getElementsByClassName('aalink')[0].href
        );
      }
      document.getElementById(id).remove();
    })
    .catch(error => console.error('Error fetching page:', url , 'reason:', error));
}

function my_table() {
  const table = document.createElement('table');
  let caption = table.createCaption();
  caption.textContent = 'Результаты проверки';
  // заголовок
  let header = table.createTHead();
  let row = header.insertRow();
  for (const the_text of [
    '№ п/п',
    'Курс',
    'ППС',
    'ППС-2',
    'Загружено',
    'Причина незагрузки',
  ]) {
    let newCell = row.insertCell();
    newCell.innerText = the_text;
  }
  // тело таблицы
  let myBody = table.createTBody();
  return table;
}

    console.log("Их бин добавлять кнопка!");
    var panel = document.getElementsByClassName('page-header-headings')[0];
    var new_button = panel.insertBefore(document.createElement("div"), panel.lastElementChild);
    new_button.className = 'btn-primary';
    new_button.id = 'stats';
    // текст на кнопке
    new_button.textContent="Сводка о загрузке курсов";
    new_button.addEventListener("click", (function(e) {
const result = my_table();
const kuda = document.getElementsByClassName('page-header-headings')[0];
kuda.appendChild(result);

// Первая страница, открытая
for (const defaultElement of document.getElementsByClassName('coursebox')) {
  chk_cource(
    result,
    defaultElement.getElementsByClassName('aalink')[0].href
  );
}

// Остальные страницы (не открыты)
for (const url of Array.from(
  document
    .getElementsByClassName('mt-1')[0]
    .getElementsByClassName('page-item'),
  x => x.getElementsByClassName('page-link')[0]['href']
).slice(1, -1)) {
  load_page(url, result);
}
}))
}
)();