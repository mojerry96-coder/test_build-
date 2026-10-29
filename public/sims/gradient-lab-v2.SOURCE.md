# Gradient Lab v2 (unchanged copy)

- Repository: https://github.com/mojerry96-coder/k12
- Commit: 179fff2 "Gradient Lab v2: Gradient Lab mark in the header, spaced question text, puzzled stands in for think" (only index.html changed from 6558d8d)
- Copied: everything in `v2/dist/` into `gradient-lab-v2/`, byte for byte (53 files). Nothing edited, renamed or left out.
- Check: `sha256sum` of every file matches a fresh clone of that commit.
- Integration is from outside only: `?level=` and `#N` (its own settings), its `gradientlab:*` reports, and reading its screen (answer boxes, sliders, tapped option) to mark answers with our engine. If the lab changes a question, update `question_sets` in the content pack.

## Fingerprints (sha256)
```
e11aab414d24dd88318c707f484f33672410a67e83b48eea8665e30b16c95a4b  ./assets/fitila/almost.webp
b11f999ba03394cf75806e90ea9c5321aae84d2a829631c57e9ca5c6ff5cdc94  ./assets/fitila/celebrate.webp
3475a91e97e4f4406d0fe3f2b95c853e0171b3a06a60fe2b19afe772bad6834f  ./assets/fitila/hint.webp
041705716eb5d6a0f8b1da778c2afd7089fc307fa9e4d67b83c3a7adfcf816be  ./assets/fitila/point.webp
b03296f5e7ce1743bea26da994a561353849917029ca50d073dfc9113284634e  ./assets/fitila/puzzled.webp
e01c3be3b79f4eac5ef2838731bf93831e5a1fb692afff6d2a0d4ec3efbca264  ./assets/fitila/raise.webp
0a1c97294288b4420034f9f72ccecdc7dbbd363211618809b0c25b9c3f3159e1  ./assets/fitila/side.webp
3e92e580bdbd496d8221c996d4f1f76c1a79c75bb5b163239e35a552254be49a  ./assets/fitila/success.webp
2b8801dd657d6b825f04f6e45860209315a10b7b43c1eddaecfdf23d0e58ebb5  ./assets/fitila/think.webp
9860d3b2eada680d89ca5c1c5a492fb17eba0cd3ca69f346481de699da5cb3a6  ./assets/fitila/thumbs.webp
db38a9e02345f9422cdfb28cfd48da250c42c14c61627bfbe23a3607ebb043d2  ./assets/fitila/wave.webp
e84db012ddcaa33ccd79104cb655b8858f2e47a1a2c85d065afcbd25ec208292  ./assets/fitila/wing.webp
03759d1f0c471a1ba2ff3a5114f23611ac4b29d8bd406aa0968ee3e44caf43d6  ./assets/fitila/wingwave.webp
4d870e38117e7c911f1d5d0738f7c5c404c1330bf2b57542860befae0b466c48  ./index.html
cc7a5cbd2d1fda1f51584acca249a971ab09aed99db105d7d98e52cadfb88135  ./media/fitila/almost.mov
432a2dceb87c9d1126084449e516cf94ce1ad0051fa4ddb06a83b8ba3cbb61b1  ./media/fitila/almost.webm
6746c0d11e0fdfce6daf33c77b6d05bd1d136c230d938c27b8065f389bd79b90  ./media/fitila/almost_poster.webp
1ac18a85a6b442f82d41a343f4d294a7f6a5c2189d4e4a3eb3b837765aa7e799  ./media/fitila/celebrate.mov
37f605c424053da506a9d17462d81c5006c6f8ed4e802382c6fda3cdefe0a73c  ./media/fitila/celebrate.webm
7681940e331285562acae0967791e7bb63bb97970af8deab48fba90b9dad2c90  ./media/fitila/celebrate_poster.webp
ba4a0d8d41d7264cb7996efd84e7dfa203bcf5f34cfa8081d91d9f2e2f03a888  ./media/fitila/hint.mov
d8dd744ef21014046ca9b4ad58b2573fc4f08ef032819eb317acfc76c52a8bb6  ./media/fitila/hint.webm
3a66604b2d77cabae7ad3b8190620796673bb96462a4c39ea0c820fa601f53c8  ./media/fitila/hint_poster.webp
b3ac8a1cf9d93816505da95b05361bcc3891cb89b3a5f891c417a025e2a703ba  ./media/fitila/point.mov
934085823f8b8b69c725bc1101a8ee3830abd5d5a55845e425c59d5d2fd1dece  ./media/fitila/point.webm
d33fac2947c2bfb48ca4ef2b2ea976ae4450ff2d532eaebc6bd5d46431416140  ./media/fitila/point_poster.webp
df80c9ca289fc411f8025625353e2a82c6eaedb2c044e8a435ae906dbba8609e  ./media/fitila/puzzled.mov
970008c182e1719a04f0416e53ecc28aed03a8365f745fe504f32d344a9b04d2  ./media/fitila/puzzled.webm
1038560c06d0c9e353e18446494d54d9048040d70e4101e8c16fa6541cc7db18  ./media/fitila/puzzled_poster.webp
b01009f82d2c7150ee6113cb54650fbc97e8c2cdb8459f6cc9245626cdb4e7dd  ./media/fitila/raise.mov
9ac9178717846428aef51ec93e1280b942f630331d2b84bb36bbcfd9163bf226  ./media/fitila/raise.webm
0e185bffab1697888f6c0bd9086310bb133acd750b3fa178e05d00a4dbcaa713  ./media/fitila/raise_poster.webp
e26c14f18c09e0cfd7f4cc1d63bd8a888442844a6a7cfcd2364cb8994ae3c9d3  ./media/fitila/side.mov
9a09400833f96bb3fee847c7e36ebda39cd125da8be2d455cc07aa6a9278cc2e  ./media/fitila/side.webm
81688457cc222cb802cf48d29f6dfcae831228037ba16d99630c998a006ef473  ./media/fitila/side_poster.webp
24d820efcb9c78b06dcb1e9547227e46aed4bae4c0c086e8ec5635316c9dcf37  ./media/fitila/success.mov
0738a290d9aab406a9f9ae5f6cf73680e9ee76be53ed06dc516c8678d3835146  ./media/fitila/success.webm
551e798206013ee7a22fb4726129dff21222b39cc6d1f9d0dd3f81cb611bd7dd  ./media/fitila/success_poster.webp
4662567fa0706251ab7c0ace67b6eafeecf98153d90d55b5cc7e93b3e096d4a9  ./media/fitila/think.mov
b7624af42d078f53ca87c4bb2fabb1ccc4914d49e634b4527951b0aec39cc090  ./media/fitila/think.webm
4b49563a853ec687db2c24bb5542c61b1a49dfcc1ce8faeaa1f5b520c2419f55  ./media/fitila/think_poster.webp
685b2603b65fc1e9ee6e8b82368b5c69d675f00798114faf23eb37b8d81c2b82  ./media/fitila/thumbs.mov
4744ba2f781904b3ddc11faa497d9bde1b3907a19dfc3dc160950bbc43b9bc03  ./media/fitila/thumbs.webm
b9ca7e38dccfe8b94ae46f17621b39ea233c74760b794bb56811988cabaa48f2  ./media/fitila/thumbs_poster.webp
2b0f5f46175731e63f5d5173a1e3ac3a44b0764330fce19db32937411e97bea1  ./media/fitila/wave.mov
c4949246f1180de9322b23436587cd5681728a83926d36bc9665ba78875833cf  ./media/fitila/wave.webm
3c00ec5d84a97b8af674a4ec58a358ba1824ee7a8b6a7546f0ff57928bc4a9ee  ./media/fitila/wave_poster.webp
26ab0ff2470d0fd44fb01fbd49667e4471280d44b09a2ee45dae6d8e098b6b2a  ./media/fitila/wing.mov
c4eacc67bad3a7aacca220f583c1af4e3035840eadd4f5b22e5d225e414ee90a  ./media/fitila/wing.webm
62be904ce6be545e9c457c704ad1d8d7965152a7c89f7c1676f37fc33d720f3c  ./media/fitila/wing_poster.webp
82bdff6522d6c1379143d3c85d113faf0470fbf73663668d1699fa877a837587  ./media/fitila/wingwave.mov
bb138d75ff0936b8ba490f0951770fa2f95ff682342742e0e667ee4eccf6bcc8  ./media/fitila/wingwave.webm
187d1e9cd63e2af74efcca543fafa0ee74da79d4fb683d21f4ed3b71a45e30fc  ./media/fitila/wingwave_poster.webp
```
