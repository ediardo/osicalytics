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
          port: 9000,
          hostname: "localhost",
          open: true
        }
      }
    },
    watch: {
      css: {
        files: [
                '**/*.scss',
                'app/app.js',
                'app/directives/*.js',
                'app/services/*.js'
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
              'app/directives/*.js',
              'app/services/*.js',
              'app/app.js'
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
