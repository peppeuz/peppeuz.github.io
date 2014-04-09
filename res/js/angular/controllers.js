'use strict';

/* Controllers */
console.log("URL: "+baseUrl + configuration.primoPiano.url);
var json;
var x2js = new X2JS();
var changed = false;


var betterControllers = angular.module('betterControllers', []);
betterControllers.controller('HomeCtrl', ['$scope','$rootScope','$log', 'nextlive','CartHandler','CacheHandler','ngProgress',
   function($scope,$rootScope, $log, nextlive,CartHandler,CacheHandler,ngProgress) 
   {
    $log.log("Controller Home");
    $rootScope.loading = true;

    //TEST TESST TEST
    $rootScope.url = baseUrl+configuration.primoPiano.url;
    //$rootScope.url = "getPrimoPianoUnificato.xml"
    $log.log("URL IN ROOTSCOPE");
    $log.log($rootScope.url);
    var promiseCall = $scope.fromService = CacheHandler.personalHttpCall($rootScope.url);
    promiseCall.then(function(test) {
        $scope.json = test;
        $rootScope.loading = false;
        var proglive = $scope.json.mBetterIPhoneMobileGateway.programmaLive_asArray; 
        $scope.avvenimenti = $scope.json.mBetterIPhoneMobileGateway.avvenimenti_asArray[0].avvenimento_asArray;
        $scope.primopiano = $scope.json.mBetterIPhoneMobileGateway.primoPiano_asArray;
        if(proglive[0].dataG_asArray!=undefined){$scope.prossimiLive = $scope.fromService = nextlive.createAvvenimentiArray(proglive);}
        $scope.$emit("Preload");
        $scope.arrayPic=[$scope.primopiano[0].item[0].urlImmagine,$scope.primopiano[0].item[1].urlImmagine];
    });

    $scope.altezza = ($(window).width())/2;

    $scope.homeSlideIndex=0;
    var arrayIndice = 1;
    $scope.salvaScommessa = function(pal,avv,scom,esito,force)
    {
        $scope.fromService = CartHandler.handleScommessa(pal,avv,scom,esito,force);
    }



    $scope.whatclass = function(pal, avv,scomm,bet)
    {
        return $scope.fromService = CartHandler.whatclass(pal,avv,scomm,bet);
    };

    $scope.tick = function() 
    {

        if (changed){
            $scope.homeSlideIndex=1;
        }
        else{
            $scope.homeSlideIndex=0;
        }
        changed=!changed;
        $scope.$apply();

    };       

    setInterval($scope.tick, 3000);

}]);

betterControllers.controller('BetCtrl', ['$scope', '$route','$rootScope','$http', '$log', '$routeParams','nextlive', '$timeout','CacheHandler','$location',
    function($scope,$route,$rootScope,$http, $log, $routeParams, nextlive, $timeout,CacheHandler,$location) 
    {
        var json;
        //$(".pageOptions").panel("close");
        $scope.slideIndex =0;
        $scope.$watch('slideIndex', function()
        {
            $log.log("Cambiato: "+$scope.slideIndex);
        });
        $scope.cliccato = function(disc,man,filter,scom,descr){
            $log.log(this.$index);
            //$scope.itemcliccato = this.$index;
            $location.path("/pageEvents/"+disc+"/"+man+"/true/false/"+descr);
        };

        $scope.selectedIndex =0;
        $scope.selectedParentIndex =0;
        $rootScope.loading = true;
        $scope.indice = 0;
        $scope.touched=false;

        $rootScope.url = baseUrl+configuration.listaManifestazioni.url;
        var promiseCall = $scope.fromService = CacheHandler.personalHttpCall($rootScope.url);
        promiseCall.then(function(test) {
            json = test;
            $scope.splittedDiscipline = $scope.fromService = nextlive.splitFour(json.mBetterIPhoneMobileGateway.discipline.disciplina_asArray);     
            if($routeParams.codDisc!=undefined)
            {
                var codDisc = $routeParams.codDisc;
                $.each($scope.splittedDiscipline, function(index){
                    var subArray = $scope.splittedDiscipline[index];
                    $.each(subArray, function(mIndex){
                        if(subArray[mIndex]._codDisc==codDisc)
                        {           
                            $scope.itemClicked(mIndex,index,codDisc);
                            $timeout(function(){
                                $scope.slideIndex=index;
                            }, 1);

                        }
                    });
                });

            }
            $scope.disc = json.mBetterIPhoneMobileGateway.discipline.disciplina_asArray[$scope.indice].manifestazioni.manifestazione_asArray;
            $rootScope.loading = false;
            // $scope.reload = function(){
            //     CacheHandler.deleteCacheElement(url)
            //     $route.reload()
            // }

        });

$scope.addTouch = function(){
    $log.log("Classe aggiunta");
    $scope.provaClasse = "test";
}

$scope.itemClicked = function ($ind, $parentIndex, codDisc) 
{
    $scope.indice = 0;
    $scope.selectedIndex = $ind;
    $scope.selectedParentIndex = $parentIndex;
    for(var i=0; i<$scope.selectedParentIndex; i++)
    {
        $scope.indice+=4;
    }
    $scope.indice+=$scope.selectedIndex;
    $scope.disc = json.mBetterIPhoneMobileGateway.discipline.disciplina_asArray[$scope.indice].manifestazioni.manifestazione_asArray;
}
var margin =70;
$scope.larghezza = (($(window).width()-($(window).width()- $("#listaEventi").width())) - margin)/4;

window.onresize = function(){

    $scope.larghezza = (($(window).width()-($(window).width()- $("#listaEventi").width())) - margin)/4;}
}]);


betterControllers.controller('EventsCtrl',['$scope', '$rootScope', '$log','$routeParams', '$location','sharedProperties', 'CartHandler','CacheHandler',
    function($scope, $rootScope, $log, $routeParams, $location, sharedProperties, CartHandler,CacheHandler)
    {
        //$(".pageOptions").panel("close");
        $scope.selectedIndex =0;
        $scope.selectedParentIndex =0;



        ///
        $scope.json;
        $scope.selectedIndex;
        $scope.fromService = sharedProperties.setUrl($location.$$path);
        $rootScope.url = baseUrl+configuration.events.url+"?codDisciplina="+$routeParams.mDisciplina+"&codManifestazione="+$routeParams.mManifestazione+"&scommesse="+$routeParams.mScommessa+"&filtri="+$routeParams.mFiltro;
        $rootScope.loading = true;
        $scope.test = $scope.$parent.preloadedJson;
        $log.log($scope.test); 
        var promiseCall = $scope.fromService = CacheHandler.personalHttpCall($rootScope.url);
        promiseCall.then(function(test) {
            var json = test;
            $scope.nomeManifestazione = $routeParams.nomeManifestazione;
            $log.log(json);
            $scope.events = json.mBetterIPhoneMobileGateway.avvenimenti_asArray[0].avvenimento_asArray;
            $scope.disc = $scope.events[0]._codDisc;
            $rootScope.loading = false;
        });

        $scope.itemClicked = function ($ind, $parentIndex, codDisc) 
        {
            $scope.indice = 0;
            $scope.selectedIndex = $ind;
            $scope.selectedParentIndex = $parentIndex;
            for(var i=0; i<$scope.selectedParentIndex; i++)
            {
                $scope.indice+=4;
            }
            $scope.indice+=$scope.selectedIndex;
            $scope.disc = json.mBetterIPhoneMobileGateway.discipline.disciplina_asArray[$scope.indice].manifestazioni.manifestazione_asArray;
        }


        $scope.salvaScommessa = function(pal,avv,scom,esito,force)
        {
            $scope.fromService = CartHandler.handleScommessa(pal,avv,scom,esito,force);
        }
        $scope.whatclass = function(pal,avv,scomm,bet)
        {
            return $scope.fromService = CartHandler.whatclass(pal,avv,scomm,bet);
        };
        $scope.itemClicked = function(ind){
            $scope.selectedIndex = ind;
        };
    }]);

betterControllers.controller('BetDetailCtrl',['$scope', '$rootScope','$log', '$routeParams', '$location', 'sharedProperties','CartHandler','CacheHandler',
    function($scope, $rootScope, $log, $routeParams, $location, sharedProperties, CartHandler,CacheHandler)
    {
        $scope.prevUrl = $scope.fromService = sharedProperties.getUrl();
        $rootScope.url = baseUrl+configuration.dettAvvenimento.url+"?codPalinsesto="+$routeParams.mPalinsesto+"&codAvvenimento="+$routeParams.mAvvenimento;
        $rootScope.loading = true;

        var promiseCall = $scope.fromService = CacheHandler.personalHttpCall($rootScope.url);
        promiseCall.then(function(test) {
            var json = test;
            $scope.avvenimento = json.mBetterIPhoneMobileGateway.avvenimenti_asArray[0].avvenimento_asArray[0];
            $scope.scommessa = $scope.avvenimento.scommesse_asArray[0].scommessa_asArray;
            $rootScope.loading = false;
        });
        //testing cache
        $scope.whatclass = function(pal,avv,scomm,bet)
        {
            return $scope.fromService = CartHandler.whatclass(pal,avv,scomm,bet);
        };
        $scope.salvaScommessa = function(pal,avv,scom,esito,force)
        {
            if($scope.whatclass(pal,avv,scom,esito).indexOf("active")!=-1)
            {
                $scope.fromService = CartHandler.removeScommessa(pal,avv,scom,esito);            }
                else
                {
                    $scope.fromService = CartHandler.handleScommessa(pal,avv,scom,esito,force);
                }

            }
        }]);


betterControllers.controller('EventsLiveCtrl', ['$scope', '$rootScope','$log', '$http', 'CartHandler',
    function($scope, $rootScope,$log, $http, CartHandler)
    {
        $rootScope.loading = true;
        $http.get(baseUrl+configuration.live.url).success(function(data)
        //$http.get("getAvvenimentiLiveScommesseProposte.xml").success(function(data) 
        {
            $rootScope.loading = false;
            json = x2js.xml_str2json(data);
            $scope.live = json.mBetterIPhoneMobileGateway.avvenimenti_asArray[0].avvenimento_asArray;
            $log.log("URL: "+baseUrl + configuration.live.url);
            $log.log($scope.live);
            $scope.salvaScommessa = function(pal,avv,scom,esito,force)
            {
                $scope.fromService = CartHandler.handleScommessa(pal,avv,scom,esito,force);
                $log.log("scomessa salvata");
            }
            $scope.whatclass = function(pal,avv,scomm,bet)
            {
                return $scope.fromService = CartHandler.whatclass(pal,avv,scomm,bet);
                $log.log("ok");
            };
        });
    }]);


betterControllers.controller('ProgrammaLiveCtrl', ['$scope', '$rootScope','$log', '$http', '$location','$routeParams','nextlive','sharedProperties','CacheHandler',
    function($scope, $rootScope,$log, $http, $location,$routeParams,nextlive,sharedProperties,CacheHandler)
    {

        $rootScope.loading = true;
        //


        $rootScope.url=baseUrl+configuration.programmaLive.url;
        var promiseCall = $scope.fromService = CacheHandler.personalHttpCall($rootScope.url);
        promiseCall.then(function(test) {
            $rootScope.loading=false;
            $scope.json = test;

            var matchlive = $scope.json.mBetterIPhoneMobileGateway;
            $scope.eventsLive = matchlive.dataG_asArray;
            $log.log("LIVE");
            $log.log
            $log.log(matchlive.dataG_asArray);
            $scope.splittedDiscipline = $scope.fromService = nextlive.splitFour(matchlive.dataG_asArray);
            $scope.larg = $(window).width();


            $scope.eventsInDate = $scope.fromService = nextlive.getAllSport($scope.eventsLive[$scope.indice]);
            $scope.$watch("selectedIndex", function()
            {
                $scope.eventsInDate = $scope.fromService = nextlive.getAllSport($scope.eventsLive[[$scope.indice]]);
                
            });

            $scope.slideIndex =0;
            $scope.$watch('slideIndex', function()
            {
                $log.log("Cambiato: "+$scope.slideIndex);
            });


        });
        //TENTATIVO DISPERATO

        $scope.slideIndex =0;
        $scope.$watch('slideIndex', function()
        {
            $log.log("Cambiato: "+$scope.slideIndex);
        });

        $scope.selectedIndex =0;
        $scope.selectedParentIndex =0;
        $rootScope.loading = true;
        $scope.indice = 0;
        $scope.touched=false;


        $scope.addTouch = function(){
            $log.log("Classe aggiunta");
            $scope.provaClasse = "test";
        }

        $scope.itemClicked = function ($ind, $parentIndex, codDisc) 
        {
         $scope.selectedIndex=this.$index;
         $scope.fromService = sharedProperties.setUrl("/pageProgrammaLive/"+this.$index);
         $scope.indice = 0;
         $scope.selectedIndex = $ind;
         $scope.selectedParentIndex = $parentIndex;
         for(var i=0; i<$scope.selectedParentIndex; i++)
         {
            $scope.indice+=4;
        }
        $scope.indice+=$scope.selectedIndex;
            //$scope.disc = json.mBetterIPhoneMobileGateway.discipline.disciplina_asArray[$scope.indice].manifestazioni.manifestazione_asArray;
        }
        var margin =70;
        $scope.larghezza = (($(window).width()-($(window).width()- $("#listaEventi").width())) - margin)/4;
        window.onresize = function(){

            $scope.larghezza = (($(window).width()-($(window).width()- $("#listaEventi").width())) - margin)/4;
        }

    }]);

betterControllers.controller('headerCtrl', ['$scope','$http','$rootScope','$log', 'sharedProperties','$location','CartHandler',
    function($scope, $http, $rootScope,$log, sharedProperties,$location, CartHandler)
    {
        $log.log("Controller Header");
        $rootScope.$watch('cart', function()
        {
            if($rootScope.cart==undefined){
                $scope.elemInCart=0    
            }else{
                if($rootScope.cart.carrello==undefined){
                    $scope.elemInCart=0    
                }else
                {
                    $log.log("Carrello");
                    $log.log($rootScope.cart);
                    $scope.elemInCart = $rootScope.cart.carrello.giocate.giocata_asArray.length;
                }
            }
        });

        $rootScope.$on('cartUpdated', function(data) 
        {
            $scope.cartcarrello = $scope.fromService = CartHandler.getCart();
        });
    }]);

betterControllers.controller('CartCtrl', ['$scope','$rootScope','$log', '$http','$location','sharedProperties','CartHandler', '$timeout','UserHandler',
    function($scope, $rootScope,$log, $http,$location,sharedProperties,CartHandler,$timeout,UserHandler)
    {

        $scope.log = function(){
            $log.log("Qui clicca");
        }
        $scope.clicked=true;
        $scope.canBet = true;
        $scope.idOttenuto;
        $scope.scommetti = function ()
        {
            if($scope.canBet==true)
            {
                if($rootScope.user!=undefined){
                    $rootScope.loading = true;
                    $scope.idOttenuto=CartHandler.getIDTransizione();
                    $rootScope.$on('scomOK',function()
                    {
                        $location.path("/pageBiglietto")
                    });}
                    else{
                        UserHandler.startLogin();
                    }
                }

            }

            $scope.clicked = true;
            $scope.giocaClick = function()
            {
                $log.log("CLICK RICEVUTO SU GIOCA");
                $rootScope.isPanelGiocaOpen=true;
            }
            $scope.cambiaImporto = function(importo)
            {
                $log.log(importo+"00");
                var imp = importo.replace(",","").replace("00","")+"00";
                $timeout(function(){
                    $scope.canBet = false;
                    CartHandler.setImporto(imp);
                    $rootScope.$broadcast('cartUpdated'); 
                    $scope.canBet = true;
                }, 3000);
            }
            $rootScope.$watch('cart', function(){
                if($rootScope.cart!=undefined)
                {
                    if($rootScope.cart.carrello==undefined)
                    {
                     if($location.$$path=="/pageChart"){
                        $rootScope.back();
                    }
                }
                else
                {
                    $log.log($rootScope.cart);
                    $scope.scommesse = $rootScope.cart.carrello.giocate.giocata_asArray;
                    $scope.carrello = $rootScope.cart.carrello;
                }
            }
        });
            $scope.rimuoviScommessa = function(pal,avv,scom,esito){
                $scope.fromService = CartHandler.removeScommessa(pal,avv,scom,esito);
            }

        }]);

betterControllers.controller('optionsController',['$scope','$rootScope','$location','$log', '$http','UserHandler','CartHandler',
    function($scope,$rootScope,$location,$log,$http,UserHandler,CartHandler){


        var self=this;
        $scope.query;
        $scope.loginValue = "Login";
        $scope.regValue= "Registrati"
        $scope.regUrl = domain+"/profilo/registrazione.html";
        $scope.isLogged = $scope.fromService = UserHandler.isLoggedIn();
        $scope.cerca = function(query)
        {
            if(query!=undefined&&query.length>2)
            {
                $http.get(baseUrl + configuration.cercaScommessa.url+"?testo="+query).success(function(data) 
                {
                    json = x2js.xml_str2json(data); 
                    $scope.ricerca = json.mBetterIPhoneMobileGateway.avvenimenti.avvenimento_asArray;
                });
            }
        };
        $rootScope.$on('UserUpdated',function()
        {
            if($rootScope.user!=undefined)
            {
                $scope.nickname = $rootScope.user._nome;
                $scope.loginValue = "Logout";
                $scope.regValue=  $scope.nickname.toUpperCase();
                $scope.isLogged = true;
                $scope.regUrl = domain+"/profilo/index.html?conf=betterhtml";
                $rootScope.loading=false;
                $rootScope.loginDialog.close();
            }
            else
            {
                $scope.nickname = undefined;
                $scope.loginValue = "Login";
                $scope.regValue= "Registrati"
                $scope.isLogged = false;
                $scope.regUrl = domain+"/profilo/registrazione.html";
            }
        });
        $scope.handleUser = function()
        {
            if($scope.isLogged)
            {
                UserHandler.logoutUser();
            }
            else
            {
                UserHandler.startLogin();
                $rootScope.handleOptionsPanel(false);
            }
        };
        $scope.refreshSaldo = function(){
            CartHandler.checkConto();

        }
    }]);

betterControllers.controller('DialogCtrl',['$scope','$rootScope','$routeParams','$location','$log','sharedProperties','$route',
    function($scope,$rootScope,$routeParams,$location,$log,sharedProperties,$route)
    {
        //$(".pageOptions").panel("close");
        var sessioneScaduta = false;
        $scope.messaggio = sharedProperties.getMsg();
        if($scope.messaggio.indexOf("sessione")!=-1)
        {
            sessioneScaduta = true;
        }
        $scope.goBack = function()
        {
            if(sessioneScaduta){
                $route.reload();
            }
            else{
                $rootScope.back();
            }
        }
    }]);

betterControllers.controller('LoginDialogCtrl',['$scope','$location','$rootScope','$log','UserHandler','SessionHandler',
    function($scope,$location,$rootScope,$log,UserHandler,SessionHandler){

        //$(".pageOptions").panel("close");
        $log.log(localStorage["username"]);
        if(localStorage["username"]==undefined){
            $scope.user= {username:"",rem: false, val: "off"}
        }
        else
        {
         $scope.user= {username:localStorage["username"],rem: false, val: "off"}
     }
     $scope.pwd = {pass: "",show:false, val:"off"};
     $scope.changeShowPwd = function()
     {
        $scope.pwd.show=!$scope.pwd.show;
    }
    $scope.changeRemember = function(){
        $scope.user.rem=!$scope.user.rem;
    }
    $scope.$watch('pwd.show', function()
    {
        $log.log('ShowPwd changed');
        if($scope.pwd.show){
            $scope.pwd.val="on"
        }
        else
        {
         $scope.pwd.val="off"
     }
 });
    $scope.$watch('user.rem',function()
    {
        if($scope.user.rem){
            $scope.user.val = "on"
        }
        else
        {
            $scope.user.val = "off"
        }
    });

    $scope.login = function()
    {
        $rootScope.loading=true;
        $log.log("Ugologin");
        $log.log($scope.user.username);
        $log.log("PWD:");
        $log.log($scope.pwd.pass);

        var promise = $scope.fromService = UserHandler.loginUser($scope.user.username,$scope.pwd.pass);

        promise.then(function(test) {
            $scope.res = test.gtw;
            $log.log("watch");
            if($scope.res.result._cod==0)
            {
                $rootScope.user = $scope.res.datiPersonali;
                $rootScope.$broadcast('UserUpdated');
                SessionHandler.getSession();
                if($scope.user.rem)
                {
                    setCookie("co_user", $scope.user.username, 30);
                    localStorage["username"] = $scope.user.username;
                }
            }else
            {
                $scope.errorMessage = $scope.res.result._descr;
                $rootScope.loading=false;
            }

        });

    }
    $rootScope.$on('UserUpdated',function()
    {
        if($location.$$path=="/loginDialog"){
            $rootScope.back();
        }
    });

}]);

betterControllers.controller('indexCtrl',['$scope','$rootScope','$location','$log','UserHandler','SessionHandler','$http','ngProgress','CacheHandler',
    function($scope,$rootScope,$location,$log,UserHandler,SessionHandler,$http,ngProgress,CacheHandler)
    {

        $scope.scroll=0;
        ngProgress.color("#599D3B");
        ngProgress.height("10");
        $scope.rightSlider =0;
        $scope.widthPanel =0;
        $scope.checked = false;
        $scope.altezzaVariabile = $(window).innerHeight();
        $scope.openSliderGiochi= function(){
            $log.log("slide left");
            $scope.checked=true;   
        }
        $scope.closeSliderGiochi= function(){
            $log.log("slide rigt");
            $scope.checked=false;   
        }
        $scope.openPanelGiochi = function()
        {
            $scope.checked=!$scope.checked;   
        }
        $scope.$watch('checked', function()
        {
          $log.log("WATCH CHECKED")
          if(!$scope.checked)
          {
            $scope.rightSlider =0;
            $scope.widthPanel =0;
            $log.log("checked");
        }
        else{   
            $scope.rightSlider =103;
            $scope.widthPanel =100;
            $log.log("not checked");
        }
    })
        /*
        $scope.$watch("scroll", function(){
            $log.log("scrolled");
            $scope.altezzaView=$(".view-container").height();
            $scope.altezzaFooter=$(".footerInfo").height();
            //$log.log($scope.altezzaView);
            //$log.log($scope.altezzaFooter);
            $log.log($(window).innerHeight());
            $scope.altezzaVariabile = $(window).innerHeight();
        });
*/
        //$log.log("Controller Index");
        $scope.fromService = SessionHandler.getSession();
        $scope.showFooter=true;
        $scope.showFooterInfo=true;
        $scope.showHeader=true;
        $rootScope.$on('sessionIDTaken', function(data) 
        {
            if($rootScope)
                $scope.$emit('cartUpdated');
        });

        $rootScope.$watch('actualLocation',function()
        {
            if($location.$$path=='/pageChart')
            {
                $scope.showFooter=false;
                $scope.showFooterInfo=true;
                $scope.showHeader=true;

            }
            else if($location.$$path=="/loginDialog"||$location.$$path=="/dialog"){
                $scope.showHeader=false;
                $scope.showFooter=false;
                $scope.showFooterInfo=false;

            }
            else
            {
                $scope.showFooter=true;
                $scope.showHeader=true;
                $scope.showFooterInfo=true;

            }
        });



//Native javascript solution
window.onresize = function(){
    if (window.innerHeight > 500)
    {
        console.log('JAVASCRIPT BLOWIN UP YER LOGS, LOGS');
        $log.log("Altezza");
        $log.log($(window).height());
        $scope.altezzaVariabile = $(window).height();
    }
}   


$rootScope.$on("Preload", function()
{
    $log.log("In preload?");
    $scope.caricamento = 0;
    var urlMondiali = baseUrl+ "getListaAvvenimentiPerManifestazione?codDisciplina=1&codManifestazione=105&scommesse=true&filtri=false";
    $log.log(urlMondiali);
    var urlSerieA = baseUrl+"getListaAvvenimentiPerManifestazione?codDisciplina=1&codManifestazione=21&scommesse=true&filtri=false";
    var urlGetAll = baseUrl+"getListaAllManifestazioni";
    $log.log(urlSerieA);
    var callAll = $scope.fromService = CacheHandler.personalHttpCall(urlGetAll,true);
    var callMondiali = $scope.fromService = CacheHandler.personalHttpCall(urlMondiali,true);
    var callSerieA = $scope.fromService = CacheHandler.personalHttpCall(urlSerieA,true);
    callAll.then(function(data){
        $log.log(data);
        $scope.caricamento++            });
    callMondiali.then(function(data){
        $scope.caricamento++
    });
    callSerieA.then(function(data){
        $scope.caricamento++
    });
    $scope.$watch('caricamento', function(){
        var percentage = 5;
        $log.log($scope.caricamento);
        switch($scope.caricamento)
        {
            case 1:
            percentage = 35;
            break;
            case 2:
            percentage = 65
            break;
            case 3:
            percentage = 100;
            ngProgress.complete();

        }                
        ngProgress.set(percentage);
    });
});
}]);

betterControllers.controller('bigliettoCtrl',['$scope','$rootScope','$location','$http','$log','sharedProperties','CartHandler','CacheHandler',
    function($scope,$rootScope,$location,$http,$log,sharedProperties,CartHandler,CacheHandler)
    {
        var url = "";
        $rootScope.loading=false;
        $scope.idTransizione = sharedProperties.getID();
        $log.log($scope.idTransizione);
        $rootScope.loading = true;

        $http.get(baseUrl + configuration.dettGiocata.url+"?sessionID="+$rootScope.sessionID+"&idTransazione="+$scope.idTransizione).success(function(data) 
        {
            json = x2js.xml_str2json(data); 
            
            $scope.dett = json.mBetterIPhoneMobileGateway.dettaglioGiocata;
            $log.log("Log Biglietto");
            $log.log($scope.dett);
            $rootScope.loading = false;

        });
        CartHandler.getCart();

    }]);