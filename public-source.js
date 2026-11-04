/* Textbook page images are bundled with this public edition. */
renderSource = function () {
  const n = sourcePages[sourceAt];
  $('#sourceRange').textContent = (sourcePages.length === 1 && n === 180 ? 'الأحاديث المطلوب حفظها في الفصل الثاني' : active ? lesson().title : 'الفهرس الأصلي من الكتاب') + ' · ص ' + ar(n);
  $('#sourcePageSelect').innerHTML = sourcePages.map((p,i) => '<option value="'+i+'" '+(sourceAt===i?'selected':'')+'>صفحة '+ar(p)+'</option>').join('');
  $('#sourcePrev').disabled = sourceAt === 0;
  $('#sourceNext').disabled = sourceAt === sourcePages.length - 1;
  $('#sourceImage').hidden = false;
  $('#sourceNotice').hidden = true;
  $('#sourceNotice').textContent = 'تعذر تحميل صورة الصفحة ' + ar(n) + '. أتحقق من اكتمال تنزيل ملفات المشروع أو أعيد المحاولة.';
  $('#sourceImage').src = 'page-' + n + '.jpg';
  $('#sourceImage').alt = 'صفحة ' + ar(n) + ' من كتاب وزارة التعليم الأصلي';
};
$('#sourceImage').addEventListener('error', function () {
  this.hidden = true;
  $('#sourceNotice').hidden = false;
});
