'use strict'

var betterServices = angular.module('betterServices', ['ngResource']);
var cache;


betterServices.service('nextlive', function(){
    return {
        createAvvenimentiArray: function(prossimilive)
        {
            var self=this;
            var avvenimenti= [];
            var temparray = [];
            prossimilive.forEach(
                function(prosLive)
                {
                    var dataG = prosLive.dataG_asArray;
                    temparray = self.createLiveArray(dataG,false);
                    temparray.forEach(
                        function(obj)
                        {
                            avvenimenti.push(obj);
                        });
                }
                );
            return avvenimenti;
        },
        splitFour: function(array)
        {
            var temparray;
            var arrayNuovo=[];
            var i,j,chunk = 4;
            for (i=0,j=array.length; i<j; i+=chunk) 
            {
                temparray = array.slice(i,i+chunk);
                arrayNuovo.push(temparray);
            }
            return arrayNuovo;
        },
        createLiveArray: function(element, needDate)
        {
            console.log(element);
            var avvenimenti= [];
            var dateEventi = [];
            element.forEach(function(element)
            {
                dateEventi.push(element.data);
                var sport = element.sportG_asArray;
                sport.forEach(
                    function(sport)
                    {
                        var manif = sport.manifG_asArray;
                        manif.forEach(function(manif)
                        {
                            var avv = manif.avvenimento_asArray;
                            avv.forEach(function(avv)
                            {
                                avvenimenti.push(avv);
                            });
                        });
                    });
            });  

            if(needDate){
                return [avvenimenti,dateEventi];
            }
            else
                return avvenimenti;
        },
        getAllSport: function(completeJson)
        {
            var arrayManifestazioni = []
            completeJson.sportG_asArray.forEach(function(el){
                el.manifG_asArray.forEach(function(manif){
                    arrayManifestazioni.push(manif);
                });
            });
            return arrayManifestazioni;
        }
    }});

betterServices.service('sharedProperties', function(){
    var url;
    var msg;
    var idTransizione;
    return{
        setUrl: function(mUrl){
            console.log("Setting route " +mUrl);
            url=mUrl;
        },
        getUrl: function(){
            return url;
        },
        setMsg: function(messaggio){
            msg = messaggio;
        },
        getMsg: function(){
            return msg;
        },
        setID: function(id){
            idTransizione=id;
        },
        getID: function(){
            return idTransizione;
        }
    }
});

betterServices.service('CartHandler',['$rootScope','$location','$http','$log','sharedProperties','SessionHandler','dialogService',
    function($rootScope,$location,$http,$log,sharedProperties,SessionHandler,dialogService){
        return{
            addScommessa: function(pal,avv,scom,esito,force)
            {
                var self = this;
                var URL = baseUrl+configuration.aggiungiScommessa.url+"?sessionID="+$rootScope.sessionID+"&codPalinsesto="+pal+"&codAvvenimento="+avv+"&codScommessa="+scom+"&codEsito="+esito+"&force_add="+force;
                $http.get(URL).success(function(data)
                {
                    $rootScope.$broadcast('cartUpdated');
                    json = x2js.xml_str2json(data);
                    self.checkStatus(json.mBetterIPhoneMobileGateway);
                });
            },
            removeScommessa: function(pal,avv,scom,esito){
                var self =this;
                var URL = baseUrl+configuration.rimuoviScommessa.url+"?sessionID="+$rootScope.sessionID+"&codPalinsesto="+pal+"&codAvvenimento="+avv+"&codScommessa="+scom+"&codEsito="+esito;
                $http.get(URL).success(function(data)
                {
                    json = x2js.xml_str2json(data);
                    self.checkStatus(json.mBetterIPhoneMobileGateway);
                    $rootScope.$broadcast('cartUpdated');
                });
            },
            getCart: function()
            {
                var self =this;
                $http.get(baseUrl+configuration.getCarrello.url+"?&sessionID="+$rootScope.sessionID).success(function(data)
                {   
                    $rootScope.cart = x2js.xml_str2json(data).mBetterIPhoneMobileGateway;
                    json = x2js.xml_str2json(data);
                    self.checkStatus(json.mBetterIPhoneMobileGateway);

                });
            },
            setImporto: function(importo){
                var self =this;
                $http.get(baseUrl + configuration.setImportoCarr.url+"?sessionID="+$rootScope.sessionID+"&importo="+importo).success(function(data) 
                {
                    json = x2js.xml_str2json(data);
                    self.checkStatus(json.mBetterIPhoneMobileGateway);
                });
            },
            getIDTransizione: function()
            {
                var risposta;
                var self = this;
                $http.get(baseUrl + configuration.scommetti.url+"?sessionID="+$rootScope.sessionID).success(function(data) 
                {
                    json = x2js.xml_str2json(data); 
                    self.checkStatus(json.mBetterIPhoneMobileGateway);
                    $log.log(json);
                    if((json.mBetterIPhoneMobileGateway.transazione!=undefined)&&(json.mBetterIPhoneMobileGateway.transazione._id!=undefined))
                    {
                        sharedProperties.setID(json.mBetterIPhoneMobileGateway.transazione._id);
                        self.checkConto();
                    }
                    else{
                        $log.log("Impossibile scommettere");
                    }
                });


            },
            checkConto: function()
            {
                var self = this;
                $http.get(baseUrl + configuration.getSaldo.url+"?sessionID="+$rootScope.sessionID).success(function(data) 
                {
                    json = x2js.xml_str2json(data); 
                    self.checkStatus(json.mBetterIPhoneMobileGateway);
                    if(json.mBetterIPhoneMobileGateway.saldo!=undefined&&json.mBetterIPhoneMobileGateway.saldo._disponibile>199)
                    {
                        $rootScope.$broadcast("scomOK");
                    }

                });   
            },
            checkStatus: function(response)
            {
                $log.log("RESPONSE");
                $log.log(response);
                if(response.result!=undefined){
                    if(response.result._cod==0)
                    {
                        $log.log("Tutto ok");
                    }
                    else if(response.result._cod==2)
                    {
                        
                    //Sessione scaduta o utente non loggato
                    $log.log("Sessione scaduta o utente non loggato");
                    SessionHandler.openSession();
                    sharedProperties.setMsg(response.result._descr);
                    var dialog = dialogService.create('error');
                    dialog.open();                    
                }
                else
                {
                    sharedProperties.setUrl($location.$$path);
                    $log.log(sharedProperties.getUrl());
                    sharedProperties.setMsg(response.result._descr);
                    var dialog = dialogService.create('error');
                    dialog.open();



                }
            }
        },
        handleScommessa: function(pal,avv,scom,esito,force)
        {
            var self = this;
            if(self.whatclass(pal,avv,scom,esito).indexOf("active")==-1)
            {
                $log.log("Aggiungi");
                self.addScommessa(pal,avv,scom,esito,force);
            }
            else
            {
                $log.log("Rimuovi");
                self.removeScommessa(pal,avv,scom,esito);
            }

        },
        whatclass: function(pal,avv,scomm,bet){
            var x;
            if($rootScope.cart==undefined||$rootScope.cart.carrello==undefined)
            {
                var x ="";
            }
            else
            {
                $rootScope.cart.carrello.giocate.giocata_asArray.forEach(function(val){
                    if((val._codPal==pal)&&(val._codAvv==avv)&&(val._codSco==scomm)&&(val._codEsito==bet))
                    {
                        x="active";
                    }
                });
            }
            return "btnPuntata ui-link "+x;

        }
    }
}]);

betterServices.service('UserHandler',['$rootScope','$location','$http','$log','CartHandler','SessionHandler','$q','dialogService',
    function($rootScope,$location,$http,$log,CartHandler,SessionHandler,$q,dialogService)
    {   return{ 
        isLoggedIn: function()
        {
            if($rootScope.user!=undefined)
            {
                return true;
            }
            else
            {
                return false;
            }
        },
        startLogin: function()
        {
            $rootScope.isLoginPanelVisible = true;
            $rootScope.loginDialog = dialogService.create('default');
            $rootScope.loginDialog.open();
        },
        loginUser: function(u,p)
        {
            var deferred = $q.defer();
            $http.post(baseUrlMPO+configuration.login.url,'username='+u+'&password='+p).success(function(response)
            { 
                json = x2js.xml_str2json(response);
                deferred.resolve(json);
            });
            return deferred.promise;
        },
        logoutUser: function()
        {
            $http.get(baseUrl+configuration.logout.url).success(function(data)
            {
                json = x2js.xml_str2json(data);
                $log.log(json);
                CartHandler.checkStatus(json.mBetterIPhoneMobileGateway);
                $rootScope.user = undefined;
                SessionHandler.getSession();
                $rootScope.$broadcast('UserUpdated');
                $location.path("/homepage")
            });
        }
    }
}]);




betterServices.service('SessionHandler',['$rootScope','$log','$http', function($rootScope,$log,$http)
{
    return{
        openSession: function(){
            $http.get(baseUrl+configuration.openSession.url).success(function(data)
            {
                json = x2js.xml_str2json(data);
                $log.log("OPEN SESSION DATA");
                $log.log(json);
            });

        },
        getSession: function(){
            $http.get(baseUrl+configuration.verifySession.url).success(function(data)
            {
                json = x2js.xml_str2json(data);
                $rootScope.sessionID = json.mBetterIPhoneMobileGateway.sessionID;
                if(json.mBetterIPhoneMobileGateway.datiPersonali!=undefined)
                {
                    $rootScope.user = json.mBetterIPhoneMobileGateway.datiPersonali;
                    $rootScope.$broadcast('UserUpdated');
                }
                $rootScope.$emit('sessionIDTaken');
                $rootScope.$broadcast('cartUpdated');


            });
        }

    }
}]);



betterServices.service('CacheHandler',['$rootScope','$log','$cacheFactory','$http','$q','CartHandler', function($rootScope,$log,$cacheFactory,$http,$q,CartHandler)
{
    cache = $cacheFactory("betterAppCache");
    var expireTime = 300000;
    //var expireTime = 15000;
    return{
        addToCache: function(k,v)
        {  
            $log.log("Adding to cache");
            $log.log(k);
            var obj = {data: v, time:  Date.now()}
            $log.log(obj.data);
            $log.log("adding to cache");
            cache.put(k,obj);
        },
        cleanCache: function()
        {
            cache.removeAll();
        },
        deleteCacheElement: function(k)
        {
            $log.log("Removing"+k);
            cache.remove(k);
        },
        getCache: function(k)
        {


            if(cache.get(k)!=undefined){

                $log.log("GETTING CACHE");
                $log.log(Date.now());
                $log.log(cache.get(k).time);
                if(Date.now()-(cache.get(k).time)>expireTime)
                {
                    $log.log("Cache expired");
                    cache.remove(k);
                    return false;
                }else
                return cache.get(k).data;
            }
            else
                return false;
        },
        personalHttpCall: function(url,preloading)
        {   
            var self = this;
            var deferredHttp = $q.defer();
            if(self.getCache(url)!=false)
            {
                $log.log("in cache");
                deferredHttp.resolve(self.getCache(url));
            }
            else
            {
                $log.log("not in cache");
                $http.get(url).success(function(data){
                    var json = x2js.xml_str2json(data);
                    console.log("NOT IN CACHE");
                    console.log(json.mBetterIPhoneMobileGateway);
                    if(preloading==undefined)
                    {
                        CartHandler.checkStatus(json.mBetterIPhoneMobileGateway);
                    }
                    deferredHttp.resolve(json);
                    self.addToCache(url,json);
                });
            }
            return deferredHttp.promise;

        }


    }
}]);

