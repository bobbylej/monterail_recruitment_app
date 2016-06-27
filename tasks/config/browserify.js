module.exports = function(grunt) {

  grunt.config.set('browserifyBundleName', 'public.js');
  grunt.config.set('browserify',{
    dev: {
      files: {
        '.tmp/public/js/<%= browserifyBundleName %>':
          ['.tmp/public/js/concat/*.js'],
      },
      options: {
        transform: ['babelify']
      }
    },
    dist:{

    }
  });

  grunt.loadNpmTasks('grunt-browserify');
};
