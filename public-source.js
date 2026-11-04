/* Original textbook scans are optional local resources, excluded from the public repository. */
const LOCAL_SOURCE_PAGES = false; // Enable only for a local copy with legally supplied scans.
renderSource = function () {
  const n = sourcePages[sourceAt];
  $('#sourceRange').textContent = (active ? lesson().title : 'فهرس الكتاب') + ' · ص ' + ar(n);
  $('#sourcePageSelect').innerHTML = sourcePages.map((p,i) => '<option value="'+i+'" '+(sourceAt===i?'selected':'')+'>صفحة '+ar(p)+'</option>').join('');
  $('#sourcePrev').disabled = sourceAt === 0;
  $('#sourceNext').disabled = sourceAt === sourcePages.length - 1;
  $('#sourceImage').hidden = !LOCAL_SOURCE_PAGES;
  $('#sourceNotice').hidden = LOCAL_SOURCE_PAGES;
  $('#sourceNotice').textContent = 'أراجع صفحة ' + ar(n) + ' في نسختي من الكتاب المدرسي. صور صفحات الكتاب الأصلية غير مضمنة في النسخة مفتوحة المصدر؛ تبقى أرقام الصفحات مرجعًا للمعلم والطالب.';
  if (LOCAL_SOURCE_PAGES) {
    $('#sourceImage').src = 'source/page-' + n + '.jpg';
    $('#sourceImage').alt = 'صفحة ' + ar(n) + ' من الكتاب';
  }
};
$('#sourceImage').addEventListener('error', function () {
  this.hidden = true;
  $('#sourceNotice').hidden = false;
});
