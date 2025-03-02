const PORT = 7777;

let http = require('http');
let static = require('node-static');
let ws = require('ws');
 
//
// Create a node-static server instance to serve the './public' folder
//
let file = new static.Server('./public');
 
let http_server = http.createServer(function (request, response) {
    request.addListener('end', function () {
        file.serve(request, response);
    }).resume();
}).listen(PORT);

let ws_server = new ws.Server({server: http_server});

let player1, player2;

let spectators = [];

let gameStarted = false;

ws_server.on('connection', function (conn){

	console.log("Usuario conectado");	
	
	if (player1 == null){
		player1 = conn;

		let info = {
			player_num: 1
		};
	
		player1.send( JSON.stringify(info) );

		player1.on('message', function (msg){
			if (player2 == null)
				return;
			
			let info = JSON.parse(msg);

			if (info.y1 != null){
				player2.send( JSON.stringify(info) );
				spectators.forEach((espectator) => {
					espectator.send( JSON.stringify(info) );
				});
			}
			else if (info.by != null) {
				player2.send( JSON.stringify(info) );
				spectators.forEach((espectator) => {
				    espectator.send( JSON.stringify(info) );
				});
			}
			else if (info.sc2 != null) {
			    player2.send( JSON.stringify(info) );
				spectators.forEach((espectator) => {
					espectator.send( JSON.stringify(info) );
				});
				if(info.sc1 >= 3){
				    let gmOv = { p: "PLAYER 1"};
	                player2.send ( JSON.stringify(gmOv) );
				    player1.send ( JSON.stringify(gmOv) );
					spectators.forEach((espectator) => {
						espectator.send( JSON.stringify(gmOv) );
					});
					return;
		        }
				if(info.sc2 >= 3){
					let gmOv = { p: "PLAYER 2"};
					player2.send ( JSON.stringify(gmOv) )
                    player1.send ( JSON.stringify(gmOv) )
					spectators.forEach((espectator) => {
						espectator.send( JSON.stringify(gmOv) );
					});
					return;																								
				}
			}
		});

		player1.on('close', function (){
			console.log("Jugador 1  desconectado");
			player1 = null;
			if(player2 && gameStarted == true){
				let dis = { d: "PLAYER 1 DISCONNECT"}
				player2.send ( JSON.stringify(dis) )
			}
		});

	}
	else if (player2 == null){
		player2 = conn;
		
		 setTimeout(function(){
		 	let gameStart ={
				gS: true
	        }
		    player2.send( JSON.stringify(gameStart) );
		    player1.send( JSON.stringify(gameStart) );
			gameStarted = true;
		 }, 1000);

		let info = {
			player_num: 2
		};

		player2.send( JSON.stringify(info) );

		player2.on('message', function (msg){
			if (player1 == null)
                return; 

			let info = JSON.parse(msg);
			               
			if (info.y2 != null){
			    player1.send( JSON.stringify(info) );
				spectators.forEach((position) => {
					position.send( JSON.stringify(info) );
				});
			}

		});

		player2.on('close', function (){
			console.log("Jugador 2  desconectado");
		    player2 = null;
		    if(player1 && gameStarted == true){
		    	let dis = { d: "PLAYER 2 DISCONNECT"}
			    player1.send ( JSON.stringify(dis) );
			}
		});
	}
	else{
		spectators.push(conn);
		let info = {
			player_num: 3
		};

		conn.send(JSON.stringify(info));

		console.log("Espectador conectado");

		conn.on('close', function (){
			console.log("Jugador 2  desconectado");
			spectators = spectators.filter(user => user !== conn);
		});

	}
		
});
