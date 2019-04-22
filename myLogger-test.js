var logger           = require('./nodes/tilogger.js')

var testObject = {'One': 1, 'Two': 'two', 'Three':{'a':'a','b':2}}

//var console = console // logger.console()
console.log('hi - standard console (console.log)', {testObject})
console.info('hi - standard console (console.info)', {testObject})
console.warn('hi - standard console (console.warn)', {testObject})
console.error('hi - standard console (console.error)', {testObject})
//console.verbose('hi - standard console (console.verbose)', {testObject})
console.debug('hi - standard console (console.debug)', {testObject})


var con = logger.console()
con.level = 'error'
con.debugging = true
con.log('hi - ti console (console.log)', {testObject})
con.info('hi - ti console (console.info)', {testObject})
con.warn('hi - ti console (console.warn)', {testObject})
con.error('hi - ti console (console.error)', {testObject})
con.verbose('hi - ti console (console.verbose)', {testObject})
con.debug('hi - ti console (console.debug)', {testObject})

con.group('mygroup')
con.info('Im in a group')
con.info('I am also ing a group')
con.groupEnd()
con.info('I am not in a group')
con.stack()
con.settings()

con = logger.console('./mylogger.log')
con.log('lo - ti console (console.log)', {testObject})
con.info('lo - ti console (console.info)', {testObject})
con.warn('lo - ti console (console.warn)', {testObject})
con.error('lo - ti console (console.error)', {testObject})
con.verbose('lo - ti console (console.verbose)', {testObject})
con.debug('lo - ti console (console.debug)', {testObject})

con.group('lo - mygroup')
con.info('lo - Im in a group')
con.info('lo - I am also ing a group')
con.groupEnd()
con.info('lo - I am not in a group')
con.stack('lo - ')
con.settings('lo - ')
