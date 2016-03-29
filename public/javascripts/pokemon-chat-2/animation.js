/**
 * Created by Ahmed on 3/19/2016.
 */

var speed = 0.1;
var stage;

function drawMap(pokemonCanvas)
{
    //GLOBAL WARNING: reads the graphicsMap,navigationMap, & assets

    var widthCell = window.innerWidth/navigationMap.width;
    var heightCell = window.innerHeight/navigationMap.height;
    navigationMap.cellLength = widthCell < heightCell ? widthCell : heightCell;
    pokemonCanvas.width = navigationMap.cellLength * navigationMap.width ;
    pokemonCanvas.height = navigationMap.cellLength * navigationMap.height;
    var background = new createjs.Container();
    for (var i = 0; i < navigationMap.width; i++)
    {
        for (var j = 0; j < navigationMap.height; j++)
        {
            var drawObjectInfo = graphicsMap[i][j];
            var tile = new createjs.Bitmap('images/'+drawObjectInfo.src);
            tile.scaleX = navigationMap.cellLength/drawObjectInfo.pixelwidth;
            tile.scaleY = navigationMap.cellLength/drawObjectInfo.pixelheight;
            tile.x = i * navigationMap.cellLength;
            tile.y = j * navigationMap.cellLength;
            background.addChild(tile);
        }
    }
    stage.addChild(background);
    stage.addChild(createAssetsFromArray(assets));
}

function createAssetsFromArray(array)
{
    var assets = new createjs.Container();
    for (var i = 0; i < array.length; i++)
    {
        var assetInfo = array[i];
        var asset = new createjs.Bitmap('images/'+assetInfo.src);
        asset.scaleX = (navigationMap.cellLength * assetInfo.width)/assetInfo.pixelwidth;
        asset.scaleY = (navigationMap.cellLength*assetInfo.height)/assetInfo.pixelheight;
        asset.x = assetInfo.x * navigationMap.cellLength;
        asset.y = assetInfo.y * navigationMap.cellLength;
        assets.addChild(asset);
    }
    return assets;
}


function startAnimation()
{
    var pokemonCanvas = document.getElementById("pokemonCanvas");
    stage = new createjs.Stage(pokemonCanvas);

    drawMap(pokemonCanvas);
    addPlayerToStage(localPlayer);

    createjs.Ticker.timingMode = createjs.Ticker.RAF;
    createjs.Ticker.setInterval(30);
    createjs.Ticker.addEventListener("tick", tick);


    function tick(event)
    {
        var movement = getMovement(localPlayer);
        if(movement[0] != 0 || movement[1] !=0)
        {
            var deltaZ = event.delta * speed;
            var newX = localPlayer.grant.x + ( deltaZ * movement[0]);
            var newY = localPlayer.grant.y + ( deltaZ * movement[1]);
            var leftLegX = newX ;
            var leftLegY = newY + navigationMap.cellLength;
            var rightLegX = newX + navigationMap.cellLength;
            var rightLegY = newY + navigationMap.cellLength;
            try
            {
                if(navigationMap[Math.round(leftLegX/navigationMap.cellLength)][Math.round(leftLegY/navigationMap.cellLength)]
                    && navigationMap[Math.round(rightLegX/navigationMap.cellLength)][Math.round(rightLegY/navigationMap.cellLength)])
                {
                    localPlayer.grant.x = newX;
                    localPlayer.grant.y = newY;
                    localPlayer.setX(localPlayer.grant.x);
                    localPlayer.setY(localPlayer.grant.y);
                    socket.emit("move player",
                        {
                            x: localPlayer.grant.x/navigationMap.cellLength,
                            y: localPlayer.grant.y/navigationMap.cellLength,
                            frame: localPlayer.grant.currentFrame
                        });
                }
                else if(navigationMap[Math.round(leftLegX/navigationMap.cellLength)][Math.round(leftLegY/navigationMap.cellLength)] == null
                    || navigationMap[Math.round(rightLegX/navigationMap.cellLength)][Math.round(rightLegY/navigationMap.cellLength)] == null)
                {
                    console.log("Reset Ticker & Clear Stage");
                    createjs.Ticker.removeAllEventListeners();
                    stage.removeAllChildren();
                    remotePlayers=[];
                    if(localPlayer.roomId==1)
                    {
                        changeRoom(2);
                    }
                    else
                    {
                        changeRoom(1);
                    }
                }
            }
            catch(err)
            {
                console.log("ERROR: "+err);
            }


        }
        stage.update(event);
    }
}


function addPlayerToStage(player)
{
    var color = "";
    if(player.color==1)
    {
        color = "green-";
    }
    var spriteHeight = 50;
    var spriteWidth = 50;
    var spriteSheet = new createjs.SpriteSheet({
        framerate: 30,
        "images": ["images/"+color+"pokemon-trainer.png"],
        "frames": { "height": 50, "count": spriteHeight, "width": spriteWidth},
        "animations": {
            "left": [4, 7,"left",0.5],
            "right": [8, 11,"right",0.5],
            "up":[12,15,"up",0.5],
            "down":[0,3,"down",0.5],
            "staionaryLeft" : 4,
            "staionaryRight" : 8,
            "staionaryDown" : 0,
            "staionaryUp" : 12
        }
    });

    var grant = new createjs.Sprite(spriteSheet, "staionaryDown");
    grant.x = player.getX()*navigationMap.cellLength;
    grant.y = player.getY()*navigationMap.cellLength;
    grant.scaleX = (navigationMap.cellLength/spriteWidth)*2;
    grant.scaleY = (navigationMap.cellLength/spriteHeight)*2;
    grant.speed = speed;

    player.grant = grant;

    grant.on('animationend',function(e){
        player.playing = false;
    });

    // Add Grant to the stage, and add it as a listener to Ticker to get updates each frame.
    stage.addChild(player.grant);
}

