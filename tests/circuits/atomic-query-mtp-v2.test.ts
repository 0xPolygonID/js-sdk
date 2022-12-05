import { defaultJSONUserClaim, IdentityTest } from "./utils";

// describe('atomic-query-mtp-v2', () => {
//     const userPK    = "28156abe7fe2fd433dc9df969286b96666489bac508612d0e16593e944c4f69f"
// 	const issuerPK  = "21a5e7321d0e2f3ca1cc6504396e6594a2211544b08c206847cdee96f832421a"
// 	const timestamp = 1642074362
// if("TestAttrQueryMTPV2_PrepareInputs", async () => {

// 	const user = await IdentityTest.newIdentity(userPK)
// 	const nonce = BigInt(0)

// 	const issuer = await IdentityTest.newIdentity(issuerPK)

// 	const subjectID = user.id
// 	const nonceSubject = BigInt(0)

// 	const {mz, claim} = defaultJSONUserClaim(subjectID)

// 	const path = merklize.NewPath(
// 		"https://www.w3.org/2018/credentials#credentialSubject",
// 		"https://w3id.org/citizenship#residentSince")

// 	const {proof:jsonP, value} = mz.proof(path)

// 	const valueKey = value.mtEntry()

// 	const values = this.prepareStrArray([]string{valueKey.String()}, 64)
// 	//string array to big.Int array
// 	const valuesBigInt = make([]*big.Int, len(values))
// 	const for i, v = range values {
// 		const in, b = new(big.Int).SetString(v, 10)
// 		require.True(t, b)
// 		valuesBigInt[i] = in

// 	}

// 	issuer.AddClaim(t, claim)

// 	const issuerClaimMtp, _ = issuer.ClaimMTPRaw(claim)

// 	const issuerClaimNonRevMtpRaw, _ = issuer.ClaimRevMTPRaw(claim)

// 	const in = AtomicQueryMTPV2Inputs{
// 		ID:                       &user.ID,
// 		Nonce:                    nonce,
// 		ClaimSubjectProfileNonce: nonceSubject,
// 		Claim: ClaimWithMTPProof{
// 			IssuerID: &issuer.ID,
// 			Claim:    claim,
// 			IncProof: MTProof{
// 				Proof: issuerClaimMtp,
// 				TreeState: TreeState{
// 					State:          issuer.State(),
// 					ClaimsRoot:     issuer.Clt.Root(),
// 					RevocationRoot: issuer.Ret.Root(),
// 					RootOfRoots:    issuer.Rot.Root(),
// 				},
// 			},
// 			NonRevProof: MTProof{
// 				TreeState: TreeState{
// 					State:          issuer.State(),
// 					ClaimsRoot:     issuer.Clt.Root(),
// 					RevocationRoot: issuer.Ret.Root(),
// 					RootOfRoots:    issuer.Rot.Root(),
// 				},
// 				Proof: issuerClaimNonRevMtpRaw,
// 			},
// 		},
// 		Query: Query{
// 			ValueProof: &ValueProof{
// 				Path:  path,
// 				Value: valueKey,
// 				MTP:   jsonP,
// 			},
// 			Operator:  EQ,
// 			Values:    valuesBigInt,
// 			SlotIndex: 2,
// 		},
// 		CurrentTimeStamp: timestamp,
// 	}

// 	const bytesInputs = in.InputsMarshal()
// 	require.Nil(t)

// 	const exp = it.TestData(t, "AttrQueryMTPV2_inputs", string(bytesInputs), *generate)
// 	t.Log(string(bytesInputs))
// 	require.JSONEq(t, exp, string(bytesInputs))

// });

// if("TestAtomicQueryMTPV2Outputs_CircuitUnmarshal", () => {
// 	const out = new(AtomicQueryMTPV2PubSignals)
// 	const err = out.PubSignalsUnmarshal([]byte(
// 		`[
//  "0",
//  "24357338057394103910029868244681596615276666879950910837900400354886746113",
//  "21443782015371791400876357388364171246290737482854988499085152504070668289",
//  "3121830522363969755182647997205952932853761720617742019387497128299229117326",
//  "3121830522363969755182647997205952932853761720617742019387497128299229117326",
//  "1642074362",
//  "180410020913331409885634153623124536270",
//  "0",
//  "0",
//  "2",
//  "1",
//  "10",
//  "0",
//  "0",
//  "0",
//  "0",
//  "0",
//  "0",
//  "0",
//  "0",
//  "0",
//  "0",
//  "0",
//  "0",
//  "0",
//  "0",
//  "0",
//  "0",
//  "0",
//  "0",
//  "0",
//  "0",
//  "0",
//  "0",
//  "0",
//  "0",
//  "0",
//  "0",
//  "0",
//  "0",
//  "0",
//  "0",
//  "0",
//  "0",
//  "0",
//  "0",
//  "0",
//  "0",
//  "0",
//  "0",
//  "0",
//  "0",
//  "0",
//  "0",
//  "0",
//  "0",
//  "0",
//  "0",
//  "0",
//  "0",
//  "0",
//  "0",
//  "0",
//  "0",
//  "0",
//  "0",
//  "0",
//  "0",
//  "0",
//  "0",
//  "0",
//  "0",
//  "0",
//  "0",
//  "0"
// ]`))

// 	const expValue = PrepareCircuitArrayValues([]*big.Int{BigInt(10)}, 64)

// 	const exp = AtomicQueryMTPV2PubSignals{
// 		UserID: it.IDFromStr(
// 			t, "24357338057394103910029868244681596615276666879950910837900400354886746113"),
// 		IssuerID: it.IDFromStr(t,
// 			"21443782015371791400876357388364171246290737482854988499085152504070668289"),
// 		IssuerClaimIdenState: it.MTHashFromStr(t,
// 			"3121830522363969755182647997205952932853761720617742019387497128299229117326"),
// 		IssuerClaimNonRevState: it.MTHashFromStr(t, "3121830522363969755182647997205952932853761720617742019387497128299229117326"),
// 		ClaimSchema:            it.CoreSchemaFromStr(t, "180410020913331409885634153623124536270"),
// 		SlotIndex:              2,
// 		Operator:               1,
// 		Value:                  expValue,
// 		Timestamp:              int64(1642074362),
// 		Merklized:              0,
// 		ClaimPathKey:           BigInt(0),
// 		ClaimPathNotExists:     0,
// 	}

// 	const jsonOut = json.Marshal(out)
// 	const jsonExp = json.Marshal(exp)

// 	require.JSONEq(t, string(jsonExp), string(jsonOut))
// });

// });
