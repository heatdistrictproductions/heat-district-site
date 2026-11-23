(function(){
  const options={
    tv:{price:'From $3,000',kicker:'School dances & homecoming',image:'school-images/dual-tv-stage-4x3.jpg',alt:'School dance setup with two totem screens',description:'A school dance setup with DJ, sound, lighting and two screens, one on each totem.',features:['DJ and sound options','360 photo booth included','Two screens, one on each totem','Both Lighting IR-4 uplighting','IntelliStage staging options'],key:'spirit'},
    prom:{price:'From $3,500',kicker:'Prom & formal dances',image:'school-images/prom-night-stage-4x3.jpg',alt:'Prom setup on a stage with violet and gold lighting',description:'A polished look with coordinated lighting and a backdrop for your prom theme.',features:['DJ and sound options','360 photo booth included','Both Lighting IR-4 uplighting','IntelliStage staging options','Photo backdrop options'],key:'prom'},
    led:{price:'From $5,000',kicker:'Large-screen experience',image:'school-images/school-led-large-four-totems-4x3.jpg',alt:'School dance stage with large LED wall and four lighting totems',description:'A large LED wall and four totems create a dramatic focal point for a school dance.',features:['DJ and sound options','360 photo booth included','Large LED wall and visual options','Four lighting totems','Both Lighting IR-4 uplighting','IntelliStage staging options'],key:'led'}
  };
  const section=document.getElementById('school-packages'); if(!section)return;
  const buttons=section.querySelectorAll('[data-school-option]');
  buttons.forEach(button=>button.addEventListener('click',()=>{
    const item=options[button.dataset.schoolOption];if(!item)return;
    buttons.forEach(b=>{const active=b===button;b.classList.toggle('is-active',active);b.setAttribute('aria-pressed',String(active));});
    const image=document.getElementById('school-main-image');image.src=item.image;image.alt=item.alt;
    document.getElementById('school-kicker').textContent=item.kicker;
    document.getElementById('school-price').textContent=item.price;
    document.getElementById('school-description').textContent=item.description;
    document.getElementById('school-features').replaceChildren(...item.features.map(text=>{const li=document.createElement('li');li.textContent=text;return li;}));
    document.getElementById('school-quote').href='contact.html?school='+item.key+'#quote-form';
  }));
})();
