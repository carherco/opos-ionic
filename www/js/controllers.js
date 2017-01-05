angular.module('opos.controllers', [], function($httpProvider) {
  // Use x-www-form-urlencoded Content-Type
  $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
 
  /**
   * The workhorse; converts an object to x-www-form-urlencoded serialization.
   * @param {Object} obj
   * @return {String}
   */ 
  var param = function(obj) {
    var query = '', name, value, fullSubName, subName, subValue, innerObj, i;
      
    for(name in obj) {
      value = obj[name];
        
      if(value instanceof Array) {
        for(i=0; i<value.length; ++i) {
          subValue = value[i];
          fullSubName = name + '[' + i + ']';
          innerObj = {};
          innerObj[fullSubName] = subValue;
          query += param(innerObj) + '&';
        }
      }
      else if(value instanceof Object) {
        for(subName in value) {
          subValue = value[subName];
          fullSubName = name + '[' + subName + ']';
          innerObj = {};
          innerObj[fullSubName] = subValue;
          query += param(innerObj) + '&';
        }
      }
      else if(value !== undefined && value !== null)
        query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
    }
      
    return query.length ? query.substr(0, query.length - 1) : query;
  };
 
  // Override $http service's default transformRequest
  $httpProvider.defaults.transformRequest = [function(data) {
    return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
  }];
})

.controller('MainCtrl', function ($scope, $state, $http, urls) {
    $scope.url_etiquetas = urls.server_url + '/etiqueta';
    $scope.etiquetas = new Array();
    
    $http.get($scope.url_etiquetas).success(function (data) {
        $scope.etiquetas = data;
    });
    
    $scope.seleccionarTest = function(etiqueta_id) {
        $state.transitionTo('test', {etiqueta_id:etiqueta_id});
    };
})
.controller('TestCtrl', function ($scope, $state, $stateParams, $http, urls) {

    $scope.url_test = urls.server_url + '/test/' + $stateParams.etiqueta_id;
    $scope.preguntas = [];
    $scope.preguntas_acertadas = [];
    $scope.preguntas_falladas = [];
    $scope.respuesta = {};
    
    $scope.comprobar = false;
    $scope.show_comprobar_button = false;
    $scope.show_siguiente_button = false;
    $scope.show_explicacion = false;
    $scope.fin =false;
    
    $http.get($scope.url_test).success(function (data) {
        $scope.preguntas = data.preguntas;
        $scope.num_preguntas = data.preguntas.length;
        $scope.id_pregunta = 0;
        $scope.siguientePregunta();
    });
 
    
    $scope.siguientePregunta = function() {
        $scope.comprobar = false;
        $scope.show_explicacion = false;
        $scope.show_comprobar_button = false;
        $scope.show_siguiente_button = false;
        
        if(($scope.id_pregunta < $scope.num_preguntas)){
            $scope.pregunta = $scope.preguntas[$scope.id_pregunta];
            //$scope.pregunta = $scope.preguntas[$scope.num_preguntas-1-$scope.id_pregunta];
            $scope.id_pregunta++;  
        } else {
            $scope.fin = true;
        }
        
    };
    
    $scope.marcarRespuesta = function(respuesta) {
        if(!$scope.comprobar){
            $scope.respuesta = respuesta;
            $scope.show_comprobar_button = true;
        }
    };
    
    $scope.comprobarRespuesta = function() {
        $scope.comprobar = true;
        $scope.show_comprobar_button = false;
        $scope.show_siguiente_button = true;
        $scope.show_explicacion = true;
        if($scope.respuesta.correcta){
            $scope.preguntas_acertadas.push($scope.pregunta);
        } else {
            $scope.preguntas_falladas.push($scope.pregunta);
        }
    };
    
    $scope.enviarPreguntasFalladas = function(){
        
        var mensaje = '';
        for(p = 0; p < $scope.preguntas_falladas.length; p++) {
            mensaje += "Pregunta: " + $scope.preguntas_falladas[p].texto + "\n\n";
            for(o = 0; o < $scope.preguntas_falladas[p].opciones.length; o++) {
                mensaje += "Opcion: " + $scope.preguntas_falladas[p].opciones[o].texto + "\n";
            }
            mensaje += "\n\n";
        }

        window.plugins.socialsharing.share(mensaje);
    };

    
});