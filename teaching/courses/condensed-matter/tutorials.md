# Intro


*Side note*: Each exercise is marked with a "NEW" or "OLD" tag. "NEW" tag means that the exercise is
made by myself this year, while the "OLD" tag means that the exercise is taken from last year's exercises pool.
# Exercise shee 1
![](exercise_sheet/sheet1.pdf)

Standard exercise. Very light-weighted. 

# Exercise sheet 2
![](exercise_sheet/sheet2.pdf)

The first exercise comes from a textbook *The Oxford Solid State Basics*. 

The second exercise is made by myself. The idea is to guide the student through the process of
continue-ize (make the system continuous, opposite to discretize) Heisenberg model. This provide a
different perspective to understand the Heisenberg model. Also it is way easier to get the
dispersion from a classical continuous system. 

The third and the fourth exercises are from last year's exercises pool.


# Exercise sheet 3
![](exercise_sheet/sheet3.pdf)

Standard exercise. Nothing special.

# Exercise sheet 4
![](exercise_sheet/sheet4.pdf)

Standard exercise. Nothing special.

# Exercise sheet 5
![](exercise_sheet/sheet5.pdf)

The two exercises are new and made by myself. 


The first exercise builds up the gape between the Landau theory and the
Ginzburg-Landau theory. It helps the student to transit from a uniform system to a non-uniform
system. Like in the exercise sheet 6, I compare the non-uniform Ginzburg-Landau theory with the
simple Ising model. The idea behind it is that I want to illustrate the physical meaning of the
gradient term \(\nabla \eta(x)\) in free energy. In fact, if you continue-ize the Ising model, a
gradient term also pops up in the Hamiltonian. Since the students are already familiar with the Ising
model, they can use this model to understand and interpret the gradient term in the Ginzburg-Landau
theory -- *this is nothing but a nearest-neighbor interaction*. 

----

The second exercise for the students to get get a deeper understanding of the susceptibility. As I
always do in the exericise sheet, I always like to start from a toy model or from a minimal system
that is simple enough to grasp but still captures all the key features of the problem. 

In this exercise, I start from a simplist \(\delta\) function, and extend it to a more general
function later on. This step-by-step approach could help the student to slowly build up their own
understanding of the concept of susceptibility.

Once they get to a more general form of the susceptibility, there comes the math. They are asked to
derive the susceptibility in a more specific but more complex system. This involves a bit of Fourier
transform and residue theorem. 

And then the exercise stops here. Ideally, there could be a follow-up exercise on the application of
the susceptibility. This follows the learning theory: you understand, then you apply. However, The standard
time the students should spend on each exercise sheet is 3-5 hours. It would be too much for the students if I squeeze in too many exercises in one sheet. 




# Exercise sheet 6
![](exercise_sheet/sheet6.pdf)

Old exercise, not so much to say about it,


# Exercise sheet 7

![](exercise_sheet/sheet7.pdf)

The first exercise is taken from last year (2024) exercises pool. Very standard exercise. The
interesting part is the using of a programming language to plot out the dispersion of the electron. 

----

The second and the third exercises are new. As stated in the preface, I intended to build up a very
simple toy model in quantum mechanics but still capture the feature of *state hopping*. Therefore,
the setup of the second exercise is a two level system with a static magnetic field. The students
were asked to write out the Hamiltonian and derive everything in *matrix* form. Given that only
the Dirac notation was used in the lecture, I think it would be beneficial to think of the same
problem from a different perspective (matrix representation).

Another try-out is the use of ChatGPT. This doesn't mean that I used ChatGPT to help me, but rather,
I actively ask the student to use ChatGPT to explain the concepts covered in the exercise sheet. In
the second exercise, GPT will be used by the student to interpret the off-diagonal elements in the
Hamiltonian.

----

The third exercise is also made by myself. This is  about an electron in a periodic potential, and it has more connections to the lecture. Since close to the BZ boundary, the electron
experience a strong perturbation and effective the Hamiltonian becomes 2-dimensional, and thus the
degenerate perturbation theory was applied in the lecture. I want the student to connect this
effective 2-dimensional Hamiltonian with the 2-level Hamiltonian in the last exercise.
Mathematically they are quite similar, so we can simply use the same method to solve them, or
interpret them in the same way. Especially the off diagonal elements in the Hamiltonian: in the
two-level system, they represent the hopping between the two levels. In this exercise, the
``hopping'' interpretation can again be applied. 

The philosophy behind these two exercises is that I want to help the student to build up a
connection between two seemly different problems which actually share the same mathematical
structure under the hood. 


# Exercise sheet 8
![](exercise_sheet/sheet8.pdf)

The first exercise on the quantum Hall effect is *patially* taken from last year (2024) exercises pool. Very
standard. The students was asked to use the Bohr-Sommerfeld quantization to calculate the energy
levels of an electron in a magnetic field. At first sight, the \(p\) in the quantization scheme
looks like a mechanical momentum, but it is actually a canonical momentum. Inside the magnetic
field, the students need to be careful about which momentum to use: the addtional vector potential
\(A\) will modify the canonical momentum. 

Therefore, I slightly change the exercise from last year, added in some hints on the usage of the
canonical momentum. This help the student to better understand the quantization scheme.

---- 

The second exercise on the Landau gauge in the Hall effect is new and made by myself. In the first
part, the students were asked to do some math to fill the missing steps in the derivation in the
lecture. Then a question was asked: (1) *How do we understand the shift in position and why does it depend on \(k\)*? (2) *How come the energy does not depend on \(k\)*? This leads to a
further discussin on the usage of canonical momentum and the mechanical momentum. 

In the last part of the exercise, another question was raised: *Does the electron behave like a free
particle in y direction?* Actually, I don't have an answer to this question. However, when I asked
this question in the tutorial session, a student came up to me with some of his rough ideas about
it. I proposed that he can try to write a note and share his ideas with the class. 

Here is his note: (to be added)

I really appreciate his enthusiasm and effort to think about the problem. His ideas and thoughts
will be very beneficial to everyone incluing me.

# Exercise sheet 9
![](exercise_sheet/sheet9.pdf)


The first exercise was taken from last year (2024) exercises pool. The students were asked to use a
gauge-fixed London equation to prove that the Magnetic field needs to be zero deep inside the
superconductor. However, there is a mystery here: the exercise did not mention the gauge at all,
which naturally leads to a question: **how come the current seems to be gauge dependent?**

This becomes a question (raised by me) in the tutorial session. I asked the students to think about
it by themselves for a week. I will come back to this question in the next tutorial session. 

Actually, this ``gauge-fixing'' is implicitly done throughout the entire exercise sheet. The
students will realize that everything seems to be gauge dependent. The difficult part is that where
this gauge fixing was done and starting from where the gauge cannot be changed any more. 

----

In the second exercise, I guided the student through the process of constructing a free energy
using only the symmetry consideration, together with some other natural assumptions (see the
exercise sheet for details). This should provide some insights into why the free energy looks the
way it dose. 

However, if the students take a closer look at the free energy, they will realize that the free
energy is not gauge invariant... This means that the gauge is again implicitly fixed somewhere, but
this is not stated. This would again be a question for the students, and will be discussed in the
next tutorial. 

---- 

The third exercise, examiningt the persistent current, is pretty standard. But in my opinion this is
very important to understand superconductor physics: The biggest mystery in
superconductors is why the current can flow without resistance. However, a lot of the times it is
not discussed properly. zero resistance is always not the main focus, but the Meissner effect is.
Therefore, this exercise let the student get a taste of the ``zero resistance'' phenomenon.

----

In the next tutorial, I answer the gauge mystery. Here is the note I wrote:

![](tutorial/gauge_mystery.pdf)


# Exercise sheet 10
![](exercise_sheet/sheet10.pdf)

Very standard exercise sheet. Nothing special. This is just to build up the gaps in the derivation
in the lecture. There is a bit of maths involved in the first exercise, not difficult though.

In the second exercise, I asked the student to calculate or to find the
frequency/energy/wavelength scale of some typical phenomena in nature. This is to help the student
to get the intuition of the order of magnitude of the phenomena. Aparently, the AC Josephson effect
and the visible light have similar frequency, and the electron cyclotron frequency is also similar
to the microwave frequency. 

<table border="1" cellpadding="6" cellspacing="0">
  <thead>
    <tr>
      <th>System / mode</th>
      <th>Typical parameter</th>
      <th>Frequency f</th>
      <th>Wavelength λ</th>
      <th>Energy E</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>AC Josephson (1 V)</td>
      <td>V = 1&nbsp;V</td>
      <td>≈ 4.8 &times; 10<sup>14</sup>&nbsp;Hz ≈ 480&nbsp;THz</td>
      <td>≈ 620&nbsp;nm</td>
      <td>2.0&nbsp;eV</td>
    </tr>
    <tr>
      <td>Visible light (example)</td>
      <td>λ = 550&nbsp;nm</td>
      <td>≈ 5.5 &times; 10<sup>14</sup>&nbsp;Hz ≈ 550&nbsp;THz</td>
      <td>550&nbsp;nm</td>
      <td>≈ 2.25&nbsp;eV</td>
    </tr>
    <tr>
      <td>Soft X-ray (example)</td>
      <td>E = 500&nbsp;eV</td>
      <td>≈ 1.2 &times; 10<sup>17</sup>&nbsp;Hz ≈ 120&nbsp;PHz</td>
      <td>≈ 2.5&nbsp;nm</td>
      <td>500&nbsp;eV</td>
    </tr>
    <tr>
      <td>Microwave (example)</td>
      <td>f = 10&nbsp;GHz</td>
      <td>10&nbsp;GHz</td>
      <td>≈ 3.0&nbsp;cm</td>
      <td>≈ 41&nbsp;µeV</td>
    </tr>
    <tr>
      <td>Plasma frequency (metal)</td>
      <td>E<sub>p</sub> ≈ 10&nbsp;eV</td>
      <td>≈ 2.4 &times; 10<sup>15</sup>&nbsp;Hz ≈ 2.4&nbsp;PHz</td>
      <td>≈ 124&nbsp;nm</td>
      <td>10&nbsp;eV</td>
    </tr>
    <tr>
      <td>Electron cyclotron</td>
      <td>B = 1&nbsp;T</td>
      <td>≈ 2.8 &times; 10<sup>10</sup>&nbsp;Hz ≈ 28&nbsp;GHz</td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td>Optical phonon (example)</td>
      <td>E ≈ 20&nbsp;meV</td>
      <td>≈ 4.8 &times; 10<sup>12</sup>&nbsp;Hz ≈ 4.8&nbsp;THz</td>
      <td></td>
      <td>20&nbsp;meV</td>
    </tr>
  </tbody>
</table>
