module.exports = function(grunt) {
  grunt.initConfig({
    sass: {
      dist: {
        options: {
          style: 'expanded'
        },
        files: {
          'assets/css/main.css': 'scss/main.scss'
        }
      }
    },
    connect: {
      server: {
        options: {
          port: 8000,
          hostname: "localhost",
          open: true
        }
      }
    },
    watch: {
      css: {
        files: [
          'scss/base/*.scss',
          'scss/layout/*.scss',
          'scss/module/*.scss',
          'scss/main.scss',
          'app/app.module.js',
          'app/directives/*.js',
          'app/services/*.js',
          'app/controllers/*.js'
        ],
        tasks: ['sass', 'concat']
      }
    },
    concat: {
      options: {
        separator: '\n\n'
      },
      dist: {
        src: [
          'app/app.module.js',
          'app/controllers/*.controller.js',
          'app/services/*.service.js',
          'app/directives/*.directive.js'
        ],
        dest: 'app/app.concat.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.registerTask('default', ['connect', 'watch']);
}
