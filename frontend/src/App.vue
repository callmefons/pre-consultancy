<template>
	<div id="app" app-data="true">

		<!-- <v-toolbar>
			<v-toolbar-side-icon class="hidden-sm-and-up"></v-toolbar-side-icon>
			<v-toolbar-title class="hidden-xs-only" @click="gotoPage('index')">Pre-Consultancy System</v-toolbar-title>
			<v-spacer></v-spacer>
			<v-btn icon>
				<v-icon>account_circle</v-icon>
			</v-btn>
			<v-btn icon>
				<v-icon>more_vert</v-icon>
			</v-btn>
		</v-toolbar>
		 -->
		<router-view/>
		
	</div>
</template>

<script>
	export default {
		name: 'App',

		methods: {

			gotoPage(name){
				this.$router.push({name:name})
			}
		}
	}

</script>

<style>
.btn:focus, .btn:active:focus, .btn.active:focus{
	outline:none;
	box-shadow:none;
}

</style>