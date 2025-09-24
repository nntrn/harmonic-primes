const fn = {
	isPrime: (num) => {
		if (num < 3 && num > 0) {
			return true
		}
		if (num % 2 == 0) {
			return false
		}
		for (let i = 3, s = Math.sqrt(num);i <= s;i++) {
			if (num % i === 0) return false
		}
		return num > 1
	},

	getDist: (arr, fn, sep = ',', precision = 13) => [
		`k${sep}count${sep}percent %`,
		Object.entries(arr
			.map(typeof fn === 'function' ? fn : (val) => val[fn])
			.reduce((acc, val) => {
				acc[val] = (acc[val] || 0) + 1
				return acc
			}, {})
		).map(
			(e) =>
				`${e[0]}${sep}${e[1]}${sep}${(e[1] / arr.length).toFixed(precision)}`
		).join('\n')
	],

	printDist: (gb, narr, sep = ', ') => [
		`<strong>${gb[0]}</strong>`,
		// '-'.repeat(30),
		gb[1],
		'-'.repeat(30),
		`total count: ${narr.length}`,
		`groups: ${gb[1].split('\n').length}`,
		`min: ${Math.min(...narr)}${sep}max: ${Math.max(...narr)}`,
		`k ≤ 9 is ${gb[1].split('\n').slice(0, 4).map((e) => e.split(/[\t]/g)[2] * 100)
			.reduce((a, b) => a + b)}%`,
	],
}

const {
	isPrime,
	getDist,
	printDist
} = fn

function checkSPrime(n, k = 2) {
	if (n % 2 === 0 || k > 1550) {
		console.error({ n, k })
		return { error: true, n, k }
	}
	if (isPrime(n + k) && isPrime(n - k)) {
		return {
			n,
			k,
			prime: n + k,
			prime_b: n - k,
			prime_t: n + k,
			equation: `${n} ± ${k} = [${n - k},${n + k}]`,
		}
	} else {
		return checkSPrime(n, k + 2)
	}
}

function createSequentialPrimes(start, end) {
	const db = []
	if (start % 2 === 0) start = start + 1
	if (end <= start) end = start + 500
	for (let i = start;i < end + 1;i += 2) {
		db.push(checkSPrime(i))
	}
	return db
}

function getLowerK(n, k2 = 3) {
	if ((n + 2) % k2 === 0) {
		return k2
	} else {
		return getLowerK(n, k2 + 2)
	}
}

function computeHarmonicPrime(n, k = 3) {
	if (n % 2 < 1 || k > 350) {
		console.error(`error: ${n}, k = ${k}`)
		return {
			error: true,
			n,
			k,
			steps: (k - 1) / 2
		}
	}
	const P = n * k - 2
	if (isPrime(P)) {
		return {
			n,
			prime: P,
			k,
			collapse_ratio: n / P,
			equation: `(${n}×${k})-2`,
			// n_is_prime: isPrime(n),
			mod_k: P % k,
			lower_k: getLowerK(P),
			steps: (k - 1) / 2,
			last: P.toString().slice(-1),
		}
	} else {
		return computeHarmonicPrime(n, k + 2)
	}
}

function getDistTable(db, sep = '\t') {
	const dist = getDist(
		// db.sort((a, b) => a.k > b.k),
		db,
		(e) => e.k,
		sep
	)

	return printDist(
		dist,
		db.map((e) => e.n)
	)
}

function createPrimesBetween(start = 1, end = 1) {
	const db = []
	if (start % 2 === 0) start = start + 1
	if (end <= start) end = start + 500
	document.querySelector('#maxprime').value = end
	for (let i = start;i < end + 1;i += 2) db.push(computeHarmonicPrime(i))
	return db
}

const kgroup = (arr) =>
	Object.entries(
		arr.reduce((a, b) => {
			const key = b.k
			a[key] = a[key] || []
			a[key].push(b.prime)
			return a
		}, {})
	).map((e) => [
		`<div>k = ${e[0]}</div>`,
		e[1].map((c) => `<span data-n="${(c + 2) / e[0]}">${c}</span>`).join(' '),
	].join('\n')).join('\n\n')

function genPrimes() {
	const minp = Number(document.querySelector('#minprime').value)
	const maxp = Number(document.querySelector('#maxprime').value)

	// const db = createSequentialPrimes(minp, maxp)
	const db = createPrimesBetween(minp, maxp)
	window.db2 = db
	const disttbl = getDistTable(db)
	sumPercent = disttbl[2]
		.split(/\n/g)
		.map((e) => e.split(/[\t]/g)[2] * 100)
		.slice(0, 4)

	// console.log(db.sort((a, b) => a.n > b.n))
	document.querySelector('#gb').innerHTML = disttbl.join('\n')
	document.querySelector('#primecode').innerHTML = kgroup(db)
}

function invokeSaveAsDialog(file, fileName) {
	if (!file) {
		throw 'Blob object is required.'
	}

	var fileExtension = file.type.split('/')[1]

	if (fileName && fileName.indexOf('.') !== -1) {
		var splitted = fileName.split('.')
		fileName = splitted[0]
		fileExtension = splitted[1]
	}

	var fileFullName = (fileName || Math.round(Math.random() * 9999999999) + 888888888)
	fileFullName += `.${fileExtension}`

	if (typeof navigator.msSaveOrOpenBlob !== 'undefined') {
		return navigator.msSaveOrOpenBlob(file, fileFullName)
	} else if (typeof navigator.msSaveBlob !== 'undefined') {
		return navigator.msSaveBlob(file, fileFullName)
	}

	var hyperlink = document.createElement('a')
	hyperlink.href = URL.createObjectURL(file)
	hyperlink.download = fileFullName
	hyperlink.style = 'display:none;opacity:0;color:transparent;'
	document.body.appendChild(hyperlink)

	if (typeof hyperlink.click === 'function') {
		hyperlink.click()
	}
	(window.URL || window.webkitURL).revokeObjectURL(hyperlink.href)
}

function save() {
	var textFile = new Blob([JSON.stringify(db2).replace(/(?<=\},)/g, '\n')], {
		type: 'text/plain',
	})
	invokeSaveAsDialog(textFile, 'primes.json')
}