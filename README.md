![Logo](https://imp-act.ml/static/media/logo-blackx.0235d1a7b00d2e0a61c7475f53cbe272.svg)

## :bookmark_tabs: Meniu

* [Demo](#demo)
* [Aplicatia pe local](#local)
* [Panou de administrare](#admin)
* [Aplicația utilizatorului](#user)
* [Cerințe tehnice comune](#tehnic)
* [Cerințe Design](#design)
* [Puncte Bonus](#bonus)

<div id="demo"></div>

## :dvd: Demo

Conturi default pentru fiecare tip de utilizator:

| url                      | tip cont       | login | parola |
| ------------------------ | -------------- | -------- |---------|
| https://imp-act.ml/login |admin  |  admin@admin.com   |adminadmin|
| https://imp-act.ml/login |administrator |  administrator@admin.com   |adminadmin|
| https://imp-act.ml/login |moderator  |  moderator@admin.com   |adminadmin|
| https://imp-act.ml/login |cetatean  |  cetatean@admin.com|adminadmin| 

<div id="local"></div>

## 🕸️ Local
```
$ npm install
$ npm run start
```

<div id="admin"></div>

## 🖥️ Panou de administrare

S-a realizat o aplicație web la care au acces doar membrii selectați din cadrul unei primării. 

- [x] Logica de autentificare/înregistrare. 
- [x] Secțiune pentru administratorul general al platformei, unde se vor
atribui administratorii pentru fiecare comună/localitate/județ.
- [x] Secțiune în care se pot vizualiza toate cererile de înregistrare a
utilizatorilor pentru o anumită comună, o localitate sau un anumit
județ. La fiecare cerere trebuie verificată dovada domicilierii. 
- [x] Secțiune în care se pot adăuga/șterge conturi de moderatori. Un
moderator are rolul de a răspunde la mesajele si comentariile
utilizatorilor. Instanța platformei pentru o comună, o localitate sau un
județ va avea un singur administrator care va avea acces la aceasta
secțiune. 
- [x] Secțiune pentru vizualizarea listei tuturor postărilor utilizatorilor ( utilizatorul poate accesa direct din feed optiunile postarii)
- [x] Posibilitatea de a seta statusul unei postări (exemplu: trimis, vizionat,
în lucru, efectuat).  
- [x] Secțiune separată în care se pot vedea toate cererile în lucru sau
terminate ( se pot filtra direct din feed).

![Register Page](https://user-images.githubusercontent.com/48189025/168477070-76ae8784-eac0-4e63-8acd-a2b9cc96c6ab.png)
![Login page](https://user-images.githubusercontent.com/48189025/168477074-6458dbdd-8a8f-4762-8c69-ae3209709b77.png)
![Main page meniu pagini](https://user-images.githubusercontent.com/48189025/168477303-6a5488a0-76b2-4a8c-b6da-f25e838d5d37.png)
![Pagini utilizatori in asteptare](https://user-images.githubusercontent.com/48189025/168477096-6db0aed0-67d0-4e9f-94fe-8e4c85668ce8.png)
![Users page](https://user-images.githubusercontent.com/48189025/168477136-af6147de-901e-4d75-aa54-f54109154234.png)
![Selectare rol](https://user-images.githubusercontent.com/48189025/168477201-af1ecb16-8bb3-48f7-9fc3-4aabca7eb9e9.png)
![Pagina postare selectare status](https://user-images.githubusercontent.com/48189025/168477362-213c2b02-af81-44ed-805c-742add280d36.png)

<div id="user"></div>


## 📱 Aplicația utilizatorului

S-a realizat o aplicație web în care
utilizatorul poate propune spre rezolvare o problema sau o dorință din
comuna/localitatea/județul în care este domiciliat.
<br/>
<div></div>

- [x] Secțiune de autentificare și înregistrare (în care se va cere o metodă
de verificare a domicilierii)
- [x] Secțiune de creare postare în care utilizatorul va adăuga un titlu, o
descriere, poze sau videoclipuri.
- [x] Secțiunea postări favorite. 
- [x] Logică de sortare în funcție de data postării sau numărul de voturi.
- [x] S-a integrat și o metodă de a afișa postări noi in lista celor populare
pentru o anumită perioadă de timp(pentru a îi oferi șansa de a fi
vizualizată și atunci când utilizatorul are selectată sortarea în funcție
de numărul de voturi). 

![Register Page](https://user-images.githubusercontent.com/48189025/168477438-b9cc3a52-ac29-4479-87ff-b0e274e45068.png)
![Login page](https://user-images.githubusercontent.com/48189025/168477447-81a4c077-c37c-4dfa-b197-98a305b583c8.png)
![Main page 1](https://user-images.githubusercontent.com/48189025/168477564-c3af8eea-b4b0-4c49-980a-8b7d6153c671.png)
![Main page meniu setari cont](https://user-images.githubusercontent.com/48189025/168477598-5f9b4667-bffe-402f-bff6-2bd722ea382f.png)
![Creaza postare](https://user-images.githubusercontent.com/48189025/168477455-fdcd724c-1ad2-4e81-abc4-3411d8ed6610.png)
![Pagina articole favorite user](https://user-images.githubusercontent.com/48189025/168477467-bd7b1bcc-af4c-4c0a-866a-438dac6ef0c8.png)
![Filtre - selectare perioada tip postari top](https://user-images.githubusercontent.com/48189025/168477495-cdfb5964-0541-4c76-bdc7-df929c82e689.png)

<div id="tehnic"></div>

## 🪛 Cerințe tehnice comune
Pagina unei postări conține un carousel cu
pozele/videoclipurile adăugate de utilizator, posibilitatea de a vota
pro/contra ideea prezentată, dar și de a comenta/răspunde la
comentarii.

![Pagina postare](https://user-images.githubusercontent.com/48189025/168477679-3bdf55fd-ba6b-4457-9a1b-765120d1068e.png)

<div id="design"></div>

## 🌈 Cerințe Design

- [x] Aplicatia este responsive.
- [x] Am folosit o tema de culori în construirea celor aplicatiei: 
![3b5998](https://img.shields.io/static/v1?label=&message=3b5998&color=3b5998)
![8b9dc3](https://img.shields.io/static/v1?label=&message=8b9dc3&color=8b9dc3)
![dae0e6](https://img.shields.io/static/v1?label=&message=dae0e6&color=dae0e6)
![fffff](https://img.shields.io/static/v1?label=&message=fffff&color=ffffff)

- [x] Identitatea aplicației: nume, logo, motto etc. 
![Login page](https://user-images.githubusercontent.com/48189025/168478763-7236f1ef-f0c9-4b4e-8d84-aebc568e54e7.png)

<div id="bonus"></div>

## ⚛️ Puncte Bonus

<b>1. Utilizatorii primesc email (design custom pentru email, este folosita aceeasi paleta de culori) in momentul in care cererea lor este aprobata/respinsa de admin/moderator, anuntandu-i astfel ca pot folosi aplicatia sau trebuie sa-si creeze un cont cu date reale.</b>
![280836954_442071947630467_8346498024269372831_n](https://user-images.githubusercontent.com/48189025/168479521-4b9e6319-0644-4073-9819-c0d8c813f2e0.png)
![280388420_1347633919052506_5189590707230142968_n](https://user-images.githubusercontent.com/48189025/168479527-1f3b4890-ccb2-4be3-abf1-301ebe541890.png)


<b>2. Cauta postari dupa cuvinte.(din titlu si descriere)</b> ![Rezultate cautare](https://user-images.githubusercontent.com/48189025/168479282-87f2ddd1-58da-4803-84fc-6ef8042657a9.png)

<b>3. <b>Atat utilizatorii cat si administratorii isi pot modifica parola(daca si-a uitat parola primeste un email de resetare parola sau o poate modifica direct din cont daca doreste, doar in cazul in care stie parola veche).</b>
![Pagina schimbare parola](https://user-images.githubusercontent.com/48189025/168479591-a33d4bb0-8c0f-41a0-b581-8f54f8c9ea8f.png)

![280553328_698470754762899_899514141051157853_n](https://user-images.githubusercontent.com/48189025/168479579-b7921147-a963-478c-b583-6d51701438be.png)


<b>4. Am creat un sistem de ranking bazat pe activitatea pe platforma.Fiecare utilizator primeste un numar de puncte pentru fiecare actiune pe care o face:</b>
  
![vote](https://img.shields.io/badge/Like%2FDislike-1%20pct-brightgreen)
![vote](https://img.shields.io/badge/Adauga%20postare%20la%20favorite-2%20pct-brightgreen)
![vote](https://img.shields.io/badge/Adauga%20comentariu-3%20pct-brightgreen)
![vote](https://img.shields.io/badge/Adauga%20postare-10%20pct-brightgreen)
![vote](https://img.shields.io/badge/Invita%20pe%20cineva%20care%20este%20acceptat%20pe%20platforma-15%20pct-brightgreen)


<b>In functie de numarul de puncte acumulate, utilizatorii avanseaza in rank: </b>
![Ranks](https://user-images.githubusercontent.com/48189025/168479963-1d66974e-1448-4237-8595-d09fed1e036f.png?style=centerme)

<b>5. Sistem de referal (orice utilizator isi poate invita prietenii pe platforma folosind un link unic sau codul QR generat pentru acesta, pentru fiecare utilizator invitat si acceptat va primi in schimb 15 puncte la rank): </b>
![Referral page](https://user-images.githubusercontent.com/48189025/168480611-6ace1085-a39c-4988-84c3-eef10e46e164.png)

<b>6. Top lunar al utilizatorilor ( Se reseteaza la sfarsitul fiecarei luni.Se bazeaza pe numarul de puncte acumulate din activitate.):
  ![Main page 1](https://user-images.githubusercontent.com/48189025/168480740-e8c4488d-68ea-477e-9e86-92b58127d500.png)
  

