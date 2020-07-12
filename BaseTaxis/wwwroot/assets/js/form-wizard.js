$(function() {
	'use strict'
	$('#wizard1').steps({
		headerTag: 'h3',
		bodyTag: 'section',
		autoFocus: true,
		titleTemplate: '<span class="number">#index#<\/span> <span class="title">#title#<\/span>',
		transitionEffect: "fade",
		labels: {
			cancel: "Cancelar",
			current: "current step:",
			pagination: "Paginación",
			finish: "Terminar",
			next: "Siguiente",
			previous: "Anterior",
			loading: "Loading ..."
		}
	});
});