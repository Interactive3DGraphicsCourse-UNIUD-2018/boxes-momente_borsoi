/**
	DEFINIZIONI:
		- origin: obj indipendente che si muove
		- stalker: array in cui vengono tracciate le ultime n posizioni di un obj origin
		- follower: obj che assume le stesse posizioni di un obj origin con un ritardo di n posizioni
**/

var geometry = new THREE.BoxGeometry(1,1,1);
var material = new THREE.MeshPhongMaterial( {color: 0x00ff00, specular: 0x050505});

function Snake (xPos, yPos, zPos){
	var bodyLength = SNAKE_LENGTH;
	this.bodyObj = new THREE.Object3D();
	this.body = this.createBody(bodyLength, xPos, yPos, zPos);
	this.stalkers = this.createMultipleStalkers();
	this.isGettingBigger = false;
	this.bodyLength = bodyLength;
}


/*
	muove il corpo dello snake seguendo gli spostamenti della testa
*/
Snake.prototype.moveBody = function (){
	for (var i=0; i<this.body.length-1; i++){
		this.moveFollower(i);
	}
}


/*
	true se lo snake è passato sopra il suo corpo
	false altrimenti
*/
Snake.prototype.isEatingHimself = function(direction){

	/**
		per vedere se si sta mangiando, controllo se almeno uno dei due spigoli frontali
		della testa sono all'interno di uno dei cubi che compongono il corpo dello snake
	**/
	var width = this.body[0].geometry.parameters.width / 2;

	// vertice destro (pensando il cubo rivolto verso l'alto)
	var v1x = this.body[0].position.x + ((direction < 2) ? + width : - width);
	var v1z = this.body[0].position.z + ((direction%3 == 0) ? + width : - width);
	//vertice sinistro (pensando il cubo rivolto verso l'alto)
	var v2x = this.body[0].position.x + ((direction%3 == 0) ? + width : - width);
	var v2z = this.body[0].position.z + ((direction < 2) ? - width : + width);

	for (var i = 2; i < this.bodyLength; i++){
		var body = this.body[i];
		var w = body.geometry.parameters.width / 2;
		var cond1 = (v1x <= body.position.x + w)&&(v1x >= body.position.x - w)&&(v1z <= body.position.z + w)&&(v1z >= body.position.z - w);
		var cond2 = (v2x <= body.position.x + w)&&(v2x >= body.position.x - w)&&(v2z <= body.position.z + w)&&(v2z >= body.position.z - w);
		if (cond1 || cond2){
			return true;
		}
	}
	return false;
}

/*
	aggiunge un cubo in coda al corpo dello snake
*/
Snake.prototype.addBodyPart = function(pos){

	// creazione del nuovo cubo
	var newBodyPart = new THREE.Mesh( geometry, material);
	newBodyPart.castShadow = true;
	newBodyPart.receiveShadow = true;
	this.bodyObj.add(newBodyPart);
	newBodyPart.position.set(pos.x, pos.y, pos.z);

	this.body.push(newBodyPart);
	this.stalkers.push(this.createStalker(this.body[this.bodyLength-3]));

	this.bodyLength++;
	this.isGettingBigger = false;
}


/*
	restituisce la posizione in cui si trova la testa dello snake
	nell'istante in cui viene chiamata questa funzione
*/
Snake.prototype.catchCurrentPosition = function(){
	return this.stalkers[0][DELAY-1];
}

/*
	True quando la coda raggiunge la posizione di dov'è stata mangiata l'ultima mela
*/
Snake.prototype.isInOriginPosition = function(position){
	var tailPos = this.body[this.bodyLength-1].position;
	if (tailPos.x == position.x && tailPos.y == position.y){
		return true;
	}
	return false;
}


/*
	PRIVATE
	crea il corpo di uno snake
*/
Snake.prototype.createBody = function(bodyLength, xPos, yPos, zPos){
	var cubes=[];
	for ( i=0; i<bodyLength; i++ ){
		cubes[i] = new THREE.Mesh( geometry, material );
		cubes[i].castShadow = true;
		cubes[i].receiveShadow = true;
		this.bodyObj.add(cubes[i]);
		cubes[i].position.set(xPos,yPos,zPos);
	}
	return cubes;
}


/*
	PRIVATE
	crea un array di stalkers
	ogni stalker è relativo a un elemento di body
*/
Snake.prototype.createMultipleStalkers = function(){
	var stalkers=[];
	for (var i = 0; i < this.body.length-1; i++){
		stalkers[i] = this.createStalker(this.body[i]);
	}
	return stalkers;
}


/*
	PRIVATE
	crea un array stalker di origin
	lo stalker appena creato avrà tutte le sue posizioni uguali pari alla posizione iniziale di origin
	questo permette il ritardo	voluto nel tracciare le posizioni di origin
*/
Snake.prototype.createStalker = function(origin){
	var stalker = [];
	for(var i = 0; i < DELAY; i++) {
	    stalker.push(origin.position.clone());
	}
	return stalker;
}


/*
	PRIVATE
	inserisce in coda all'array stalker la posizione attuale del cubo alla posizione passata
	rimuove la posizione in testa
*/
Snake.prototype.updateStalker = function(index){
	this.stalkers[index].shift();
	this.stalkers[index].push(this.body[index].position.clone());
}

/*
	PRIVATE
	esegue un passo del follower del cubo alla posizione index
*/
Snake.prototype.moveFollower = function(index){
	var x = this.stalkers[index][0].x;
	var y = this.stalkers[index][0].y;
	var z = this.stalkers[index][0].z;
	this.body[index+1].position.set(x,y,z);
	this.updateStalker(index);
}
