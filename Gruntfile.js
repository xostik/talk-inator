module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-contrib-less');

    grunt.initConfig({
        less : {
            default: {
                src: ['styles/less/talk.less'],
                dest: 'styles/css/main.css'
            }
        }
    });
};