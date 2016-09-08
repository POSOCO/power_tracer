angular.module('sortApp', [])

    .controller('mainController', function ($scope) {
        $scope.sortType = 'power'; // set the default sort type
        $scope.sortReverse = true;  // set the default sort order
        $scope.searchLine = '';     // set the default search/filter term

        // create the list of lines
        $scope.lines = [
            {name: '1 Line', nominal_power: 1100, power: 800},
            {name: '2 Line', nominal_power: 600, power: 700},
            {name: '3 Line', nominal_power: 200, power: 150},
            {name: '4 Line', nominal_power: 600, power: 550}
        ];

    });