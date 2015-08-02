module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-contrib-less');

    grunt.initConfig({
        less : {
            default: {
                src: ['styles/less/main.less'],
                dest: 'styles/css/main.css'
            }
        }
    });

    grunt.task.registerTask('default',
        [
            'less'
        ]
    );
};