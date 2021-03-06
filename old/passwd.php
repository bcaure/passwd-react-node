<!doctype html>
<?php
if(!isset($_SERVER['HTTPS']) || $_SERVER['HTTPS'] == ""){
    $redirect = "https://".$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI'];
    header("HTTP/1.1 301 Moved Permanently");
    header("Location: $redirect");
}
?>
<html ng-app="passwd">
<head>
    <!-- META -->
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1"><!-- Optimize mobile viewport -->

    <title>Angular Passwd App</title>

    <!-- SCROLLS -->
    <link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.0.0/css/bootstrap.min.css"><!-- load bootstrap -->
	
	<link rel="stylesheet" type="text/css" href="/passwd/css/passwd.css" />
	<!--<link id="color-link1" class="link-selector" rel="stylesheet" type="text/css" href="/passwd/css/less/color.css" />-->
	<!--<link id="color-link2" class="link-selector" rel="stylesheet" type="text/css" href="/passwd/css/less/color2.css" />-->
	<link id="color-link2" class="link-selector" rel="stylesheet" type="text/css" href="/passwd/css/sass/color.css" />

    <!-- SPELLS -->
    <script src="//ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js"></script><!-- load jquery -->
    <script src="//ajax.googleapis.com/ajax/libs/angularjs/1.4.8/angular.min.js"></script><!-- load angular -->
    <script src="passwd.js"></script>

</head>
<body ng-controller="MainController as main">
    <div class="container">

        <!-- HEADER COUNT -->
		<div class="page-header row">
			<div class="text-center col-md-12">
				<h1><span class="label label-primary" style="position: relative;top: -5px">{{ main.passwords.length }}</span>&nbsp;login/passwords!</h1>
			</div>
		</div>
        <!-- LIST -->
		<form ng-submit="main.show()" class="row" style="margin-bottom:1vh" ng-hide="main.isConnected">
			<div class="col-xs-12 col-md-2 col-md-offset-1">
				<input type="text" class="form-control input-lg text-center" 
					   required placeholder="login" ng-model="main.formData.user">
			</div>
			<div class="col-xs-12 col-md-2 col-md-offset-1">
				<input type="password" class="form-control input-lg text-center" 
					   required placeholder="password" ng-model="main.formData.password">
			</div>
			<div class="col-xs-12  col-md-2 col-md-offset-1">
				<input type="submit" class="btn btn-primary btn-lg" value="Connect" />
			</div>
		</form>
		<div class="label label-error">
			{{ main.errorMsg }}
		</div>
        <div id="passwords-list" class="row" ng-show="main.isConnected && main.passwords.length > 0">
            <div class="table-responsive">

				<div class="panel panel-primary">
				  <!-- Default panel contents -->
				  <div class="panel-heading container">
					  <div class="row">
						  <div class="col-xs-4 col-md-2"><h4>Result</h4></div>
						  <div class="col-xs-6 col-md-4 col-md-offset-2">
							  <input type="text" class="form-control" placeholder="Type text here..." ng-model="main.searchText.$"
									 style="position: relative;top: 3px;left: 4px;">
						  </div>
						  <div class="col-xs-2 col-md-1 col-md-offset-3">
							  <button type="button" class="btn btn-primary" ng-click="main.toggleCreate()" style="position: relative;top: 3px"><span class="glyphicon glyphicon-plus-sign"></span></button>
						  </div>
					  </div>
				  </div>
				  <!-- Table -->
				  <table id="maintable" class="table table-striped">
					<thead ng-show="main.isCreating">
						<tr>
							<td colspan="3" class="container">
								<div class="col-xs-4 col-md-1">URL:</div>
								<div class="col-xs-8 col-md-5">
									<input type="text" class="form-control" ng-model="main.newPassword.url" />
								</div>							
								<div class="col-xs-4 col-md-1">Login:</div>
								<div class="col-xs-8 col-md-5">
									<input type="text" class="form-control" ng-model="main.newPassword.login" />
								</div>
								<div class="col-xs-4 col-md-1">Name:</div>
								<div class="col-xs-8 col-md-5">
									<input type="text" class="form-control" ng-model="main.newPassword.label" />
								</div>
								<div class="col-xs-8 col-md-1">Password:</div>
								<div class="col-xs-4 col-md-5">
									<input type="text" class="form-control" ng-model="main.newPassword.password" />
								</div>
							</td>
							<td>
								<button type="button" class="btn" ng-click="main.create()">
									<span class="glyphicon glyphicon-ok-sign"></span>
								</button>
								<button type="button" class="btn" ng-click="main.toggleCreate()">
									<span class="glyphicon glyphicon-remove-sign"></span>
								</button>
							</td>
						</tr>
					</thead>
					<tbody>
						<tr ng-repeat="password in main.passwords | filter:main.searchText">
							<td ng-switch="password.isEditing">
								<span title="{{password.url}}" ng-switch-default><a href="{{password.url}}">{{ password.label }}</a></span>
								<div ng-switch-when="true">
									<input type="text" class="form-control"  
										   ng-model="password.url" />
								</div>
							</td>	
							<td ng-switch="password.isEditing">
								<span title="{{password.login}}" ng-switch-default>{{ password.login }}</span>
								<div ng-switch-when="true">
									<input type="text" class="form-control" 
										   ng-model="password.login" />
								</div>	
							</td>
							<td ng-switch="password.isEditing">
								<span title="{{password.password}}" ng-switch-default>{{ password.password }}</span>
								<div ng-switch-when="true">
									<input type="text" class="form-control" 
										   ng-model="password.password" />
								</div>
							</td>
							<td style="text-align:right" ng-switch="password.isEditing">
								<button type="button" ng-switch-default class="btn" ng-click="main.toggleEdit(password)">
									<span class="glyphicon glyphicon-info-sign"></span>
								</button>
								<button type="button" class="btn" ng-switch-default ng-click="main.deleteRow(password)">
									<span class="glyphicon glyphicon-minus-sign"></span>
								</button>
								<button type="button" ng-switch-when="true" class="btn" ng-click="main.update(password)">
									<span class="glyphicon glyphicon-ok-sign"></span>
								</button>
								<button type="button" ng-switch-when="true" class="btn" ng-click="main.toggleEdit(password)">
									<span class="glyphicon glyphicon-remove-sign"></span>
								</button>
							</td>
						</tr>					  
					</tbody>
				  </table>
				</div>				
            </div>
        </div>

    </div>

</body>
</html>