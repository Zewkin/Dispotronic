angular.module('Insta').factory('helpers', function () {
    return {
        removeFromGridById: function(id, alias, array) {
            var index;
            for (index in array) {
                if (array[index][alias] == id) {
                    array.splice(index, 1);
                    break;
                }
            }
        },
        updateGridById: function(id, alias, array, newData) {
            var index;
            for (index in array) {
                if (array[index][alias] == id) {
                    array[index] = newData;
                    break;
                }
            }
        },
        getByField: function(array, field, value) {
            var index;
            for (index in array) {
                if (array[index][field] == value) {
                    return array[index];
                }
            }
        },
        /**
         * moves ONE(first found) entity from array #1 to array #2 by attribute value
         * and returns the entity reference
         */
        moveEntityByAttribute: function(from, to, attribute, value) {
            for(var index in from) {
                if (from[index][attribute] == value) {
                    var entityToMove = from[index];
                    from.splice(index, 1);
                    to.push(entityToMove);
                    return entityToMove;
                }
            }
        },
        arrayFlip: function(array) {
            var flipped = {};
            angular.forEach(array, function(value, index){
                flipped[value] = index;
            });
            return flipped;
        },
        stringSortFunc: function(a,b){
            return a.name.localeCompare(b.name);
        },
        getStrHash: function() {
            var params = Array.prototype.slice.call(arguments);
            return encodeURI(params.join().replace(/ /g,''));
        }
    };
});